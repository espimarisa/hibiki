/**
 * @file loader
 * @description Utilities for loading and registering Hibiki modules.
 * @author Espi Marisa <contact@espi.me>
 */

import { readdir } from "node:fs/promises";
import { bot } from "$root/hibiki.ts";
import type { Command } from "$root/utils/typings.ts";
import { REGEX_MODULE_FILETYPE } from "$utils/constants.ts";
import { env } from "$utils/env.ts";
import { Collection, logger } from "@discordeno/bot";
import type { PathLike } from "bun";

export const commands = new Collection<string, Command>();

/**
 * Imports an entire directory.
 * @param directory The directory to scan and import.
 */

export async function importDirectory(directory: PathLike) {
	const files = await readdir(directory.toString(), { recursive: true });

	// Iterate through each file; only load modules
	for (const file of files) {
		if (!REGEX_MODULE_FILETYPE.test(file)) {
			continue;
		}

		try {
			// Imports the file
			await import(`file://${process.cwd()}/${directory}/${file}`);
			logger.info(`Successfully imported ${directory}/${file}`);
		} catch (error) {
			// Log our errors like the good person we are
			logger.fatal(`Failed to import ${directory}/${file}:`);
			throw new Error(Bun.inspect(error));
		}
	}
}

/**
 * Registeres an individual Hibiki command in-memory.
 * @param command The commaind to load.
 */

export function createHibikiCommand(command: Command) {
	commands.set(command.name, command);
}

/**
 * Registers an array of commands to the Discord gateway.
 * @param guild Whether or not to register guild-only commands.
 */

export async function registerGatewayCommands(guild = false) {
	// Registers guild-only commands
	if (guild) {
		if (!env.DISCORD_GUILD_ID) {
			logger.fatal("No DISCORD_GUILD_ID, not registering guild commands.");
			return;
		}

		try {
			await bot.helpers.upsertGuildApplicationCommands(
				env.DISCORD_GUILD_ID,
				commands.array(),
			);
		} catch (error) {
			logger.fatal("Failed to register guild commands:");
			throw new Error(Bun.inspect(error));
		}
	} else {
		try {
			// Registers global commands
			await bot.helpers.upsertGlobalApplicationCommands(commands.array());
			logger.info("Successfully registered global commands.");
		} catch (error) {
			logger.fatal("Failed to register global commands:");
			throw new Error(Bun.inspect(error));
		}
	}

	// Log each command  registered
	for (const command of commands.array()) {
		logger.info(`Successfully registered command ${command.name} to Discord`);
	}
}
