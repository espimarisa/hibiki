/**
 * @file Creates a Discord.js sharding manager.
 * @license zlib
 */

import { client } from "@/root/client.js";
import { IS_DEVELOPMENT } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { getDirname, loadCommands, loadListeners } from "@/utils/fs.js";
import { initI18Next } from "@/utils/i18n.js";
import { clientLog, sharderLog } from "@/utils/logger.js";
import { hostname } from "node:os";
import { join } from "node:path";
import { captureException, init } from "@sentry/bun";
import type { ClientUser } from "discord.js";
import { Collection, ShardingManager } from "discord.js";

// Gets directories to use.
const SRC_DIRECTORY = getDirname(import.meta.url);
const COMMANDS_DIRECTORY = join(SRC_DIRECTORY, "./commands");
const LISTENERS_DIRECTORY = join(SRC_DIRECTORY, "./listeners");
const LOCALES_DIRECTORY = join(SRC_DIRECTORY, "./locales");

// Gets the client file to initialize.
const CLIENT_FILE_NAME = `client.${IS_DEVELOPMENT ? "ts" : "js"}`;
const CLIENT_FILE_PATH = join(SRC_DIRECTORY, CLIENT_FILE_NAME);

// Creates collections to store modules in.
const hibikiCommands = new Collection<string, HibikiCommand>();
const eventListeners = new Collection<string, HibikiListener<ClientEvent>>();
const readyShards = new Set();

// Initializes Sentry.
if (env.SENTRY_DSN) {
  clientLog.debug("Initializing Sentry...");

  // Spawns the Sentry client.
  try {
    init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      release: env.npm_package_version,
      serverName: hostname(),
    });

    clientLog.info("Successfully initialized Sentry.");
  } catch (err) {
    clientLog.error(err, "Failed to initialize Sentry.");
  }
}

// Creates the primary Discord.js sharding manager.
const sharder = new ShardingManager(CLIENT_FILE_PATH, {
  mode: "process",
  respawn: true,
  token: env.BOT_TOKEN,
  totalShards: "auto",
});

// Loads i18next, commands, and listeners.
await initI18Next(LOCALES_DIRECTORY);
await loadCommands(COMMANDS_DIRECTORY, hibikiCommands);
await loadListeners(LISTENERS_DIRECTORY, eventListeners);

// Appends commands and the sharder to the client.
client.commands = hibikiCommands;
client.sharder = sharder;

// Shard creation handler.
sharder.on("shardCreate", (shard) => {
  // Shard death handler.
  shard.on("death", () => {
    sharderLog.error(`Shard #${shard.id} died.`);
  });

  // Shard disconnect handler.
  shard.on("disconnect", () => {
    sharderLog.debug(`Shard #${shard.id} disconnected.`);
  });

  // Shard error handler.
  shard.on("error", (err) => {
    sharderLog.error(err, `Shard #${shard.id} encountered an error.`);
    captureException(err, { extra: { shardID: shard.id } });
  });

  // Shard ready handler.
  shard.on("ready", () => {
    sharderLog.debug(`Shard #${shard.id} is ready.`);
  });

  // Shard spawn handler.
  shard.on("spawn", () => {
    sharderLog.debug(`Shard #${shard.id} spawned.`);
  });

  // Shard message handler.
  shard.on("message", async (message) => {
    if (message.type === "shardReady") {
      // Adds the shard to the ready list.
      readyShards.add(shard);

      // Log when all shards are ready.
      if (readyShards.size === sharder.totalShards) {
        // Gets client information from shard 0.
        const user = (await sharder.broadcastEval((c) => c.user, {
          shard: 0,
        })) as ClientUser | undefined;

        // Very weird edge case handler; things will likely break but hey, we can try.
        if (!user) {
          sharderLog.error("No user object returned from Discord.");
          return;
        }

        // Logs user information when fully connected.
        sharderLog.info("All shards are ready.");
        sharderLog.info(`Connected to Discord as ${user.username}/${user.id}.`);
      }
    }
  });
});

// Spawns shards.
try {
  await sharder.spawn();
} catch (err) {
  sharderLog.error(err, "Error while spawning shards.");
  captureException(err);
}

// Subscribes event listeners to their events.
for (const listener of eventListeners.values()) {
  try {
    if (listener.once) {
      // Runs event listeners for events that only should be handled once.
      client.once(listener.event, async (...args) => {
        clientLog.debug(`Running single event listener for ${listener.event}.`);
        await listener.handle(...args);
      });
    } else {
      // Runs the event listener for the event.
      client.on(listener.event, async (...args) => {
        clientLog.debug(`Running event listener for ${listener.event}.`);
        await listener.handle(...args);
      });
    }
  } catch (err) {
    clientLog.error(err, `Error running event listener for ${listener.event}.`);
    captureException(err, { extra: { event: listener.event } });
  }
}
