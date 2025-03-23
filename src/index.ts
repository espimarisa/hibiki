/**
 * @file bot
 * @description Initializes Hibiki.
 * @author Espi Marisa <contact@espi.me>
 */

import { bot } from "$root/hibiki.ts";
import { env } from "$utils/env.ts";
import { importDirectory, registerGatewayCommands } from "$utils/loader.ts";

bot.logger.info("Starting discordeno...");

// Loads event handlers
bot.logger.info("Loading event handlers...");
await importDirectory("src/events");

// Loads commands
bot.logger.info("Loading commands...");
await importDirectory("src/commands");

// Registers commands to the gateway
bot.logger.info("Registering commands...");
await registerGatewayCommands(env.NODE_ENV === "development");

// Starts the bot instance
await bot.start();
