/**
 * @file Spawns shards and creates a bot client.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { bot } from "@/root/bot.js";
import { env } from "@/utils/env.js";
import { parseError } from "@/utils/error.js";
import {
  getDirname,
  hibikiCommands,
  hibikiEvents,
  loadCommands,
  loadEvents,
} from "@/utils/fs.js";
import { initI18Next } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { join } from "node:path";
import { init } from "@sentry/bun";
import { type ClientUser, ShardingManager } from "discord.js";

// Gets important directories and the client file
const ROOT_DIRECTORY = getDirname(import.meta.url);
const ROOT_FILE_NAME = `bot.${env.NODE_ENV === "production" ? "js" : "ts"}`;
const ROOT_FILE = join(ROOT_DIRECTORY, ROOT_FILE_NAME);
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");
const COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands");
const EVENTS_DIRECTORY = join(ROOT_DIRECTORY, "./events");

const readyShards = new Set();

// Initialize sentry if a DSN is provided
if (env.SENTRY_DSN) {
  try {
    init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      release: env.npm_package_version,
      tracesSampleRate: 0.2,
    });

    logger.info(`Sentry connected to DSN ${env.SENTRY_DSN}`);
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error initializing Sentry: ${error.message}`);
  }
}

// Creates a ShardingManager
const sharder = new ShardingManager(ROOT_FILE, {
  mode: "process",
  respawn: true,
  token: env.DISCORD_TOKEN,
  totalShards: "auto",
});

// Loads i18next, commands, and events
await initI18Next(LOCALES_DIRECTORY);
await loadCommands(COMMANDS_DIRECTORY, hibikiCommands);
await loadEvents(EVENTS_DIRECTORY, hibikiEvents);

// Appends commands, and the sharder to the client
bot.commands = hibikiCommands;
bot.sharder = sharder;

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
    const error = parseError(err);
    logger.error(`Shard #${shard.id} encountered an error: ${error.message}`);
    throw error;
  });

  // Shard ready
  shard.on("ready", () => {
    logger.info(`Shard #${shard.id} is ready`);
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
        })) as ClientUser | undefined;

        // Logs client information when ready
        logger.info(`Connected to Discord as ${user?.username} (${user?.id})`);
      }
    }
  });
});

try {
  // Spawns shards
  await sharder.spawn();

  // Subscribe event handlers to their listeners
  for (const event of hibikiEvents.values()) {
    // Run handlers that only listen once
    if (event.once) {
      bot.once(event.event, async (...args) => await event.runEvent(...args));
    } else {
      // Run handlers when their subscribed events are emitted
      bot.on(event.event, async (...args) => await event.runEvent(...args));
    }
  }
} catch (err) {
  const error = parseError(err);
  logger.error(`Error while spawning shards: ${error.message}`);
  throw error;
}
