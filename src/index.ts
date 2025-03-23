/**
 * @file bot
 * @description Initializes Hibiki.
 * @author Espi Marisa <contact@espi.me>
 */

import { bot } from "$root/hibiki.ts";
import { importDirectory } from "$utils/loader.ts";

bot.logger.info("Starting discordeno...");

// Loads commands
bot.logger.info("Loading commands...");
await importDirectory("src/commands");

// Loads event handlers
bot.logger.info("Loading event handlers...");
await importDirectory("src/events");

// Starts the bot instance
await bot.start();
