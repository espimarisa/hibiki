/**
 * @file Spawns shards and creates a bot client.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { HibikiCommand } from "@/helpers/command.js";
import type { HibikiEvent, HibikiListener } from "@/helpers/event.js";
import { client } from "@/root/client.js";
import { env } from "@/root/utils/env.js";
import { captureError, initSentry, parseError } from "@/utils/error.js";
import { getDirname, loadCommands, loadEvents } from "@/utils/fs.js";
import { initI18Next } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { hostname } from "node:os";
import { join } from "node:path";
import { type ClientUser, Collection, ShardingManager } from "discord.js";

// Gets the root directory and the bot client file
const ROOT_DIRECTORY = getDirname(import.meta.url);
const CLIENT_FILE_NAME = `client.${env.NODE_ENV === "production" ? "js" : "ts"}`;
const CLIENT_FILE = join(ROOT_DIRECTORY, CLIENT_FILE_NAME);

// Gets directories to load
const COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands");
const EVENTS_DIRECTORY = join(ROOT_DIRECTORY, "./events");
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");

// Creates collections to store modules into
const hibikiCommands = new Collection<string, HibikiCommand>();
const hibikiEvents = new Collection<string, HibikiEvent<HibikiListener>>();
const readyShards = new Set();

// Connects to Sentry
if (env.SENTRY_DSN) {
  initSentry(env.SENTRY_DSN, {
    environment: env.NODE_ENV,
    release: env.npm_package_version,
    serverName: hostname(),
  });
}

/**
 * Creates the primary Discord.js sharding manager.
 */

const sharder = new ShardingManager(CLIENT_FILE, {
  mode: "process",
  respawn: true,
  token: env.DISCORD_TOKEN,
  totalShards: "auto",
});

// Loads i18next, commands, and event listeners
await initI18Next(LOCALES_DIRECTORY);
await loadCommands(COMMANDS_DIRECTORY, hibikiCommands);
await loadEvents(EVENTS_DIRECTORY, hibikiEvents);

// Appends commands and the sharder to the client
client.commands = hibikiCommands;
client.sharder = sharder;

/**
 * Shard creation handler.
 */

sharder.on("shardCreate", (shard) => {
  /**
   * Shard death message handler.
   */

  shard.on("death", () => {
    logger.error(`Shard #${shard.id} died`);
  });

  /**
   * Shard disconnect message handler.
   */

  shard.on("disconnect", () => {
    logger.error(`Shard #${shard.id} disconnected`);
  });

  /**
   * Shard error message handler.
   */

  shard.on("error", (err) => {
    const error = parseError(err);
    logger.error(`Shard #${shard.id} encountered an error: ${error.message}`);
    captureError(error, {
      shard: shard.id,
    });
  });

  /**
   * Shard ready message handler.
   */

  shard.on("ready", () => {
    logger.info(`Shard #${shard.id} is ready`);
  });

  /**
   * Shard spawn message handler.
   */

  shard.on("spawn", () => {
    logger.info(`Shard #${shard.id} spawned`);
  });

  /**
   * Shard message message handler.
   */

  shard.on("message", async (message) => {
    if (message.type === "shardReady") {
      // Adds the shard to the ready list
      readyShards.add(shard);

      // Log when all shards are ready
      if (readyShards.size === sharder.totalShards) {
        logger.info("All shards are ready");

        // Gets client information from shard 0
        const user = (await sharder.broadcastEval((client) => client.user, {
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
  for (const event of hibikiEvents.values()) {
    // Runs event handlers that only fire once
    if (event.once) {
      client.once(event.event, async (...args) => await event.handle(...args));
    } else {
      // Runs event handlers on each event emitter
      client.on(event.event, async (...args) => await event.handle(...args));
    }
  }
} catch (err) {
  const error = parseError(err);
  logger.fatal(`Error spawning shards: ${error.message}`);
  captureError(error);
}
