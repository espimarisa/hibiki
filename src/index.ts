/**
 * @file Spawns shards and creates a bot client.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { bot } from "@/root/bot.js";
import { env } from "@/utils/env.js";
import { captureError, initSentry, parseError } from "@/utils/error.js";
import {
  getDirname,
  hibikiCommandInteractions,
  hibikiListeners,
  loadCommandInteractions,
  loadListeners,
} from "@/utils/fs.js";
import { initI18Next } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { hostname } from "node:os";
import { join } from "node:path";
import { type ClientUser, ShardingManager } from "discord.js";

// Gets the root directory and primary bot file
const ROOT_DIRECTORY = getDirname(import.meta.url);
const BOT_FILE_NAME = `bot.${env.NODE_ENV === "production" ? "js" : "ts"}`;
const BOT_FILE = join(ROOT_DIRECTORY, BOT_FILE_NAME);

// Gets directories to load
const INTERACTIONS_DIRECTORY = join(ROOT_DIRECTORY, "./interactions/commands");
const LISTENERS_DIRECTORY = join(ROOT_DIRECTORY, "./listeners");
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");

// Creates a set for storing a list of ready shards
const readyShards = new Set();

// Connects to Sentry
if (env.SENTRY_DSN) {
  initSentry(env.SENTRY_DSN, {
    environment: env.NODE_ENV,
    release: env.npm_package_version,
    serverName: hostname(),
  });
}

/** The primary Discord.js ShardingManager controlling all client shards. */
const sharder = new ShardingManager(BOT_FILE, {
  mode: "process",
  respawn: true,
  token: env.DISCORD_TOKEN,
  totalShards: "auto",
});

// Loads i18next and command interactions
await initI18Next(LOCALES_DIRECTORY);
await loadCommandInteractions(
  INTERACTIONS_DIRECTORY,
  hibikiCommandInteractions,
);

// Loads event listeners
await loadListeners(LISTENERS_DIRECTORY, hibikiListeners);

// Appends commands and the sharder to the spawned client
bot.commands = hibikiCommandInteractions;
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
    captureError(error, {
      shard: shard.id,
    });
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

      // Log when all shards are ready
      if (readyShards.size === sharder.totalShards) {
        logger.info("All shards are ready");

        // Gets client information from shard 0
        const user = (await sharder.broadcastEval((bot) => bot.user, {
          shard: 0,
        })) as ClientUser | undefined;

        // Logs if a user object is not returned
        if (!user) {
          logger.fatal("No user object received from Discord. This is bad!");
          return;
        }

        // Logs user information when fully connected
        logger.info(`Connected to Discord as ${user.username} (${user.id})`);
      }
    }
  });
});

// Spawns shards
try {
  await sharder.spawn();

  // Subscribes event handlers to their listeners
  for (const event of hibikiListeners.values()) {
    if (event.once) {
      // Runs event handlers that only fire once
      bot.once(
        event.event,
        async (...args) => await event.runListener(...args),
      );
    } else {
      // Runs event handlers on each event emitter
      bot.on(event.event, async (...args) => await event.runListener(...args));
    }
  }
} catch (err) {
  const error = parseError(err);
  logger.error(`Error spawning shards: ${error.message}`);
  captureError(error);
}
