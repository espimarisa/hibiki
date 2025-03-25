/**
 * @file Registers commands
 * @description Registers commands to the Discord Gateway.
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import { importDirectory, registerGatewayCommands } from "$utils/loader.ts";
import { bot } from "src/bot.ts";

const isDevelopment = env.NODE_ENV === "development";

// Loads commands
bot.logger.info("Loading commands...");
await importDirectory("src/commands");

// Registers commands to the gateway
bot.logger.info("Registering commands...");
await registerGatewayCommands();

// Log where we registered commands to
isDevelopment
	? bot.logger.info(`Completed registering commands to ${env.DISCORD_GUILD_ID}`)
	: bot.logger.info("Completed registering global commands");

// Kills the REST manager
process.exit();
