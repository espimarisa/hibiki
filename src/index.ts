/**
 * @file Manages shards and spawns a Discord.js client.
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import type { HibikiEvent, HibikiListener } from "@/helpers/event.ts";
import { client } from "@/root/client.ts";
import { env } from "@/root/utils/env.ts";
import { captureError, initSentry, parseError } from "@/utils/error.ts";
import { getDirname, loadCommands, loadEvents } from "@/utils/fs.ts";
import { initI18Next } from "@/utils/i18n.ts";
import { clientLog, sharderLog } from "@/utils/logger.ts";
import { hostname } from "node:os";
import { join } from "node:path";
import { type ClientUser, Collection, ShardingManager } from "discord.js";

// Gets the root directory and the client file.
const ROOT_DIRECTORY = getDirname(import.meta.url);
const CLIENT_FILE = join(ROOT_DIRECTORY, "client.ts");

// Gets directories to load.
const COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands");
const EVENTS_DIRECTORY = join(ROOT_DIRECTORY, "./events");
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");

// Creates collections to store modules into.
const hibikiCommands = new Collection<string, HibikiCommand>();
const hibikiEvents = new Collection<string, HibikiEvent<HibikiListener>>();
const readyShards = new Set();

// Connects to Sentry.
if (env.SENTRY_DSN) {
  initSentry(env.SENTRY_DSN, {
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

// Loads i18next, commands, and event listeners.
await initI18Next(LOCALES_DIRECTORY);
await loadCommands(COMMANDS_DIRECTORY, hibikiCommands);
await loadEvents(EVENTS_DIRECTORY, hibikiEvents);

// Appends commands and the sharder to the client.
client.commands = hibikiCommands;
client.sharder = sharder;

// Shard creation handler.
sharder.on("shardCreate", (shard) => {
  // Shard death handler.
  shard.on("death", () => {
    sharderLog.error(`Shard #${shard.id} died`);
  });

  // Shard disconnect handler.
  shard.on("disconnect", () => {
    sharderLog.error(`Shard #${shard.id} disconnected`);
  });

  // Shard error handler.
  shard.on("error", (err) => {
    const error = parseError(err);
    sharderLog.error(
      `Shard #${shard.id} encountered an error: ${error.message}`,
    );

    captureError(error, { shard: shard.id });
  });

  // Shard ready handler.
  shard.on("ready", () => {
    sharderLog.info(`Shard #${shard.id} is ready`);
  });

  // Shard spawn handler.
  shard.on("spawn", () => {
    sharderLog.info(`Shard #${shard.id} spawned`);
  });

  // Shard message handler.
  shard.on("message", async (message) => {
    if (message.type === "shardReady") {
      // Adds the shard to the ready list.
      readyShards.add(shard);

      // Log when all shards are ready.
      if (readyShards.size === sharder.totalShards) {
        sharderLog.info("All shards are ready.");

        // Gets client information from shard 0.
        const user = (await sharder.broadcastEval((client) => client.user, {
          shard: 0,
        })) as ClientUser | undefined;

        // Logs if a user object is not returned.
        if (!user) {
          sharderLog.fatal("No user object received from Discord. Stopping.");
          return;
        }

        // Logs user information when fully connected.
        sharderLog.info(`Connected to Discord as ${user.username}/${user.id}.`);
      }
    }
  });
});

// Spawns shards.
try {
  await sharder.spawn();
} catch (err) {
  const error = parseError(err);
  sharderLog.fatal(`Error spawning shards: ${error.message}`);
  captureError(error);
}

// Subscribes event handlers to their listeners.
for (const event of hibikiEvents.values()) {
  event.once
    ? client.once
    : client.on(event.event, async (...args) => {
        clientLog.debug(`Running event handler for ${event.event}.`);

        // Runs the event.
        await event.handle(...args).catch((err) => {
          const error = parseError(err);
          clientLog.error(
            `Error running event handler for event ${event.event}: ${error.message}`,
          );

          captureError(error, { event: event.event });
        });
      });
}
