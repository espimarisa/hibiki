/**
 * @file Creates a sharding manager and spawns a bot client.
 * @author Espi Marisa <contact@espi.me>
 * @module index
 */

import { env } from "@/utils/env.js";
import { getError } from "@/utils/error.js";
import { events, registerEvents } from "@/utils/event.js";
import { getDirname, importDir } from "@/utils/fs.js";
import { initI18N } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { join } from "node:path";
import { init } from "@sentry/bun";
import { type ClientUser, ShardingManager } from "discord.js";

// Gets important directories and the client file
const ROOT_DIRECTORY = getDirname(import.meta.url);
const COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands");
const EVENTS_DIRECTORY = join(ROOT_DIRECTORY, "./events");
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");
const ROOT_FILE = `bot.${env.NODE_ENV === "production" ? "js" : "ts"}`;
const ROOT_FILE_PATH = join(ROOT_DIRECTORY, ROOT_FILE);
const readyShards = new Set();

// Initialze Sentry
if (env.SENTRY_DSN) {
	try {
		init({
			dsn: env.SENTRY_DSN,
			environment: env.NODE_ENV,
			release: env.npm_package_version,
		});

		logger.info("Successfully connected to Sentry");
	} catch (err) {
		const error = getError(err);
		logger.error(`Error connecting to Sentry: ${error.message}`);
		throw new Error(error.cause);
	}
}

// Initializes i18next
await initI18N(LOCALES_DIRECTORY);

/** Creates the primary Discord.js ShardingManager. */
export const sharder = new ShardingManager(ROOT_FILE_PATH, {
	mode: "process",
	token: env.DISCORD_TOKEN,
	totalShards: "auto",
});

// Logs specific sharding events
sharder.on("shardCreate", (shard) => {
	// Shard death
	shard.on("death", () => {
		logger.error(`Shard #${shard.id} died`);
	});

	// Shard disconnect
	shard.on("disconnect", () => {
		logger.error(`Shard #${shard.id} disconnected`);
	});

	// Shard error
	shard.on("error", (err) => {
		const error = getError(err);
		logger.error(`Shard #${shard.id} encountered an error: ${error.cause}`);
		throw new Error(error.cause);
	});

	// Shard ready
	shard.on("ready", () => {
		logger.info(`Shard #${shard.id} is ready`);
	});

	// Shard reconnecting
	shard.on("reconnecting", () => {
		logger.warn(`Shard #${shard.id} is reconnecting`);
	});

	// Shard resume
	shard.on("resume", () => {
		logger.warn(`Shard #${shard.id} has resumed`);
	});

	// Shard spawn
	shard.on("spawn", () => {
		logger.info(`Shard #${shard.id} spawned`);
	});

	// Shard message
	shard.on("message", async (message) => {
		if (message.type === "shardReady") {
			// Adds the shard to the ready list
			readyShards.add(shard);

			// Handlers for when all shards are ready
			if (readyShards.size === sharder.totalShards) {
				logger.info("All shards are ready");

				// Gets client information from shard 0
				const user = (await sharder.broadcastEval((bot) => bot.user, {
					shard: 0,
				})) as ClientUser;

				// Logs client information when fully ready
				logger.info(`Connected to Discord as ${user?.tag} (${user?.id})`);
			}
		}
	});
});

// Loads commands and events
logger.info("Loading commands...");
await importDir(COMMANDS_DIRECTORY, true);
logger.info("Loading events...");
await importDir(EVENTS_DIRECTORY);

// Spawns shards
try {
	await sharder.spawn();
	registerEvents(events);
} catch (err) {
	const error = getError(err);
	logger.error(`Error spawning shards: ${error.message}`);
	throw new Error(error.cause);
}
