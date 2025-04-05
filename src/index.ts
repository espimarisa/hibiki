/**
 * @file Creates a sharding manager and spawns a bot client.
 * @author Espi Marisa <contact@espi.me>
 * @module index
 */

import { bot } from "@/root/bot.js";
import { env } from "@/utils/env.js";
import { getError } from "@/utils/error.js";
import {
  getDirname,
  loadEventHandlers,
  loadSlashCommands,
} from "@/utils/fs.js";
import { initI18N } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { join } from "node:path";
import { init } from "@sentry/bun";
import { type ClientUser, Collection, ShardingManager } from "discord.js";

// Gets important directories and the client file
const ROOT_DIRECTORY = getDirname(import.meta.url);
const SLASH_COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands/slash");
const EVENT_HANDLERS_DIRECTORY = join(ROOT_DIRECTORY, "./handlers");
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");
const ROOT_FILE = `bot.${env.NODE_ENV === "production" ? "js" : "ts"}`;
const ROOT_FILE_PATH = join(ROOT_DIRECTORY, ROOT_FILE);
const readyShards = new Set();

/** A Discord.js collection of valid Hibiki slash commands. */
export const slashCommands = new Collection<string, HibikiSlashCommand>();

/** A Discord.js collection of valid Hibiki event handlers. */
export const eventHandlers = new Collection<string, HibikiEventHandlerTypes>();

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
    throw new Error(error.stack);
  }
}

// Loads i18next, slash commands, and event handlers
await initI18N(LOCALES_DIRECTORY);
await loadSlashCommands(SLASH_COMMANDS_DIRECTORY, slashCommands);
await loadEventHandlers(EVENT_HANDLERS_DIRECTORY, eventHandlers);

// Append slashCommands to bot.client
bot.slashCommands = slashCommands;

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
    logger.error(`Shard #${shard.id} encountered an error: ${error.message}`);
    throw new Error(error.stack);
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
        logger.info(`Connected to Discord as ${user.username} (${user?.id})`);
      }
    }
  });
});

try {
  // Spawns shards
  await sharder.spawn();

  // Subscribe event handlers to their listeners
  for (const handler of eventHandlers.values()) {
    // Run handlers that only listen once
    if (handler.once) {
      bot.once(
        handler.event,
        async (...args) => await handler.runHandler(...args),
      );
    } else {
      // Run handlers when their subscribed events are emitted
      bot.on(
        handler.event,
        async (...args) => await handler.runHandler(...args),
      );
    }
  }
} catch (err) {
  const error = getError(err);
  logger.error(`Error spawning shards: ${error.message}`);
  throw new Error(error.stack);
}

/**
 * Gets the total number of guilds across all shards.
 * @returns The total number of guilds across all shards.
 */

export async function getTotalGuilds() {
  const results = await sharder.broadcastEval((client) =>
    client.guilds.fetch().then((guilds) => guilds.size),
  );

  return results.reduce((acc, count) => acc + count, 0);
}

/**
 * Gets the total number of cached guilds across all shards.
 * @returns The total number of cached guilds across all shards.
 */

export async function getTotalCachedGuilds() {
  const total = (await sharder.fetchClientValues(
    "guilds.cache.size",
  )) as number[];

  if (total.length === 0) {
    return;
  }

  return total.reduce((a, b) => a + b);
}

/**
 * Gets the total number of cached users across all guilds.
 * @returns The total number of cached users across all guilds.
 */

export async function getTotalCachedUsers() {
  const total = (await sharder.fetchClientValues(
    "users.cache.size",
  )) as number[];

  if (total.length === 0) {
    return;
  }

  return total.reduce((a, b) => a + b);
}
