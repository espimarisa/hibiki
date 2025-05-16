/**
 * @file Creates a Discord.js sharding manager.
 * @license zlib
 */

import { client } from "@/root/client.ts";
import {
  COMMANDS_DIRECTORY,
  LISTENERS_DIRECTORY,
  SRC_DIRECTORY,
} from "@/utils/constants.ts";
import { env } from "@/utils/env.ts";
import { loadCommands, loadListeners } from "@/utils/fs.ts";
import { clientLog, sharderLog } from "@/utils/logger.ts";
import { hostname } from "node:os";
import { join } from "node:path";
import { captureException, init } from "@sentry/bun";
import type { ClientUser } from "discord.js";
import { Collection, ShardingManager } from "discord.js";

// Gets the root directory and the client file.
const CLIENT_FILE = join(SRC_DIRECTORY, "client.ts");

// Creates collections to store modules into.
const chatCommands = new Collection<string, HibikiChatCommand>();
const eventListeners = new Collection<string, HibikiListener<HibikiEvent>>();
const readyShards = new Set();

// Initializes Sentry.
if (env.SENTRY_DSN) {
  init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: env.npm_package_version,
    serverName: hostname(),
  });
}

// Creates the primary Discord.js sharding manager.
const sharder = new ShardingManager(CLIENT_FILE, {
  mode: "process",
  respawn: true,
  token: env.DISCORD_TOKEN,
  totalShards: "auto",
});

// Initializes i18next.
import "@/utils/i18n.ts";

// Loads chat commands.
await loadCommands(COMMANDS_DIRECTORY, chatCommands);

// Loads event listeners.
await loadListeners(LISTENERS_DIRECTORY, eventListeners);

// Appends commands and the sharder to the client.
client.chatCommands = chatCommands;
client.sharder = sharder;

// Shard creation handler.
sharder.on("shardCreate", (shard) => {
  // Shard death handler.
  shard.on("death", () => {
    sharderLog.error(`Shard #${shard.id} died.`);
  });

  // Shard disconnect handler.
  shard.on("disconnect", () => {
    sharderLog.error(`Shard #${shard.id} disconnected.`);
  });

  // Shard error handler.
  shard.on("error", (err) => {
    sharderLog.error(err, `Shard #${shard.id} encountered an error.`);
    captureException(err, { extra: { shardID: shard.id } });
  });

  // Shard ready handler.
  shard.on("ready", () => {
    sharderLog.info(`Shard #${shard.id} is ready.`);
  });

  // Shard spawn handler.
  shard.on("spawn", () => {
    sharderLog.info(`Shard #${shard.id} spawned.`);
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
          sharderLog.warn("No user object returned from Discord.");
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
