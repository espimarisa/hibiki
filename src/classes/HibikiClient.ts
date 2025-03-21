/**
 * @file HibikiClient
 * @description Creates a Hibiki client instance
 * @author Espi Marisa <contact@espi.me>
 */

import path from "node:path";
import type { HibikiCommand } from "$classes/HibikiCommand.ts";
import type { HibikiEvent } from "$classes/HibikiEvent.ts";
import { env } from "$utils/env.ts";
import { loadModules, subscribeToEvents } from "$utils/loader.ts";
import { logger } from "$utils/logger.ts";
import { Client, type ClientOptions } from "discord.js";

// Directories to crawl
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");

export class HibikiClient extends Client {
	readonly commands = new Map<string, HibikiCommand>();
	readonly events = new Map<string, HibikiEvent>();

	/**
	 * Creates a new Hibiki client instance
	 * @param options Discord.js client options
	 */

	constructor(options: ClientOptions) {
		super(options);

		// Client error handler
		this.on("error", (error) => {
			throw new Error(Bun.inspect(error));
		});
	}

	/**
	 * Initializes a Hibiki instance
	 */

	init() {
		try {
			// Attempts to login to Discord
			this.login(env.DISCORD_TOKEN).catch((error) => {
				throw new Error(Bun.inspect(error));
			});

			// Ready listener
			this.on("ready", async () => {
				if (!this.user) {
					// Prevents a weird edge case where no user object is generated
					throw new Error("No user was provided by Discord");
				}

				// Loads commands and events and subscribes to event listeners
				await loadModules(this, COMMANDS_DIRECTORY, "commands");
				await loadModules(this, EVENTS_DIRECTORY, "events");
				subscribeToEvents(this, this.events);

				// Logs information when ready
				logger.info(`Logged into Discord as ${this.user.tag}`);
				logger.info(`${this.commands.size.toString()} commands loaded`);
				logger.info(`${this.events.size.toString()} event listeners loaded`);
			});
		} catch (error) {
			// Client initialization error handler
			logger.error("Error during initialization:");
			throw new Error(Bun.inspect(error));
		}
	}
}
