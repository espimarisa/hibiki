/**
 * @file interaction
 * @description Event listener and handler for the interactionCreate event.
 * @author Espi Marisa <contact@espi.me>
 */

import { bot } from "$root/hibiki.ts";
import { commands } from "$utils/loader.ts";
import { InteractionTypes } from "@discordeno/types";

/**
 * Runs an interaction when the interactionCommand event is fired.
 * @param interaction The interaction event to handle.
 */

bot.events.interactionCreate = async (interaction) => {
	// Only handle ApplicationCommand interactions
	if (interaction.type !== InteractionTypes.ApplicationCommand) {
		return;
	}

	// Don't run interactions that have no data or name (edge case)
	if (!interaction.data?.name) {
		return;
	}

	// Finds the command to run
	const command = commands.get(interaction.data.name);

	// Don't run commands that are invalid; weird edge-case
	if (!command) {
		bot.logger.error(`Command ${interaction.data.name} not found`);
		return;
	}

	// Executes the command
	try {
		await command.runCommand(interaction);
	} catch (error) {
		bot.logger.error(`Error while running ${command.name}:`);
		throw new Error(Bun.inspect(error));
	}
};
