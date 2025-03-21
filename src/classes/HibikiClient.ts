/**
 * @file HibikiClient
 * @description Creates a Hibiki client instance
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import { logger } from "$utils/logger.ts";
import { Client, type ClientOptions } from "discord.js";

export class HibikiClient extends Client {
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
			this.on("ready", () => {
				// Run when given a user object
				if (this.user) {
					logger.info(`Logged into Discord as ${this.user.tag}`);
				}
			});
		} catch (error) {
			// Client initialization error handler
			logger.error("Error during initialization:");
			throw new Error(Bun.inspect(error));
		}
	}
}
