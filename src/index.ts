/**
 * @file Creates a primary Discord.js sharding manager.
 * @author Espi Marisa <contact@espi.me>
 * @module index
 */

import { HIBIKI_COMMANDS } from "@/utils/command.js";
import { env } from "@/utils/env.js";
import { initSentry } from "@/utils/error.js";
import { HIBIKI_EVENTS, subscribeToEvents } from "@/utils/event.js";
import { getDirname, importDirectory } from "@/utils/fs.js";
import { loaderLogger, shardingLogger } from "@/utils/logger.js";
import { type ClientUser, ShardingManager } from "discord.js";
import path from "node:path";

// Gets the bot client file and important directories
const ROOT_DIRECTORY = getDirname(import.meta.url);
const COMMANDS_DIRECTORY = path.join(ROOT_DIRECTORY, "./commands");
const EVENTS_DIRECTORY = path.join(ROOT_DIRECTORY, "./events");
const HIBIKI_FILE = `hibiki.${env.NODE_ENV === "production" ? "js" : "ts"}`;
const HIBIKI_FILE_PATH = path.join(ROOT_DIRECTORY, HIBIKI_FILE);
const readyShards = new Set();

// Initialze Sentry
if (env.SENTRY_DSN) {
	initSentry();
}

// Initialze i18next
import "@/utils/i18n.js";

// Creates a new sharding manager
export const sharder = new ShardingManager(HIBIKI_FILE_PATH, {
	mode: "process",
	token: env.DISCORD_TOKEN,
	totalShards: "auto",
});

// Logs specific sharding events
sharder.on("shardCreate", (shard) => {
	// Shard death
	shard.on("death", () => {
		shardingLogger.error(`Shard #${shard.id} died`);
	});

	// Shard disconnect
	shard.on("disconnect", () => {
		shardingLogger.error(`Shard #${shard.id} disconnected`);
	});

	// Shard error
	shard.on("error", (error) => {
		shardingLogger.error(`Shard #${shard.id} encountered an error:`);
		throw new Error(Bun.inspect(error));
	});

	// Shard ready
	shard.on("ready", () => {
		shardingLogger.info(`Shard #${shard.id} is ready`);
	});

	// Shard reconnecting
	shard.on("reconnecting", () => {
		shardingLogger.warn(`Shard #${shard.id} is reconnecting`);
	});

	// Shard resume
	shard.on("resume", () => {
		shardingLogger.warn(`Shard #${shard.id} has resumed`);
	});

	// Shard spawn
	shard.on("spawn", () => {
		shardingLogger.info(`Shard #${shard.id} spawned`);
	});

	// Shard message
	shard.on("message", async (message) => {
		if (message.type === "shardReady") {
			// Adds the shard to the ready list
			readyShards.add(shard);

			if (readyShards.size === sharder.totalShards) {
				// Log when all shards are ready
				shardingLogger.info("All shards are ready");

				// Gets bot client information from shard 0
				const botUser = (await sharder.broadcastEval((bot) => bot.user, {
					shard: 0,
				})) as ClientUser;

				// Logs bot client information when fully ready
				shardingLogger.info(
					`Connected to Discord as ${botUser.tag} (${botUser.id})`,
				);
			}
		}
	});
});

// Loads commands
loaderLogger.info("Loading commands...");
await importDirectory(COMMANDS_DIRECTORY).then(() => {
	loaderLogger.info(`Successfully loaded ${HIBIKI_COMMANDS.size} commands`);
});

// Loads event handlers
loaderLogger.info("Loading events...");
await importDirectory(EVENTS_DIRECTORY).then(() => {
	loaderLogger.info(`Successfully loaded ${HIBIKI_EVENTS.size} events`);

	// Spawns shards
	sharder
		.spawn()
		.catch((error) => {
			shardingLogger.error("Error while spawning shards:");
			throw new Error(Bun.inspect(error));
		})
		.then(() => {
			// Subscribes to events
			subscribeToEvents(HIBIKI_EVENTS);
		});
});
