/**
 * @file bot
 * @description Initializes Hibiki.
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import { importDirectory } from "$utils/loader.ts";
import { sentryInit } from "$utils/sentry.ts";
import { bot } from "src/bot.ts";

// Starts Sentry if a DSN is provided
if (env.SENTRY_DSN && env.SENTRY_DSN.length > 0) {
	sentryInit();
}

// Starts Discordeno
bot.logger.info("Starting discordeno...");

// Loads commands
bot.logger.info("Loading commands...");
await importDirectory("src/commands");

// Loads event handlers
bot.logger.info("Loading event handlers...");
await importDirectory("src/events");

// Starts the bot instance
await bot.start();
