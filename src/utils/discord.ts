/**
 * @file Utilities interacting with Discord or Discord.js directly.
 * @author Espi Marisa
 * @license zlib
 */

/**
 * Gets the total number of guilds across all shards.
 * @returns The total number of guilds across all shards.
 */

import type { ShardingManager } from "discord.js";

export async function getTotalGuilds(sharder: ShardingManager) {
  const results = await sharder.broadcastEval((client) =>
    client.guilds.fetch().then((guilds) => guilds.size),
  );

  return results.reduce((acc, count) => acc + count, 0);
}

/**
 * Gets the total number of cached guilds across all shards.
 * @returns The total number of cached guilds across all shards.
 */

export async function getTotalCachedGuilds(sharder: ShardingManager) {
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

export async function getTotalCachedUsers(sharder: ShardingManager) {
  const total = (await sharder.fetchClientValues(
    "users.cache.size",
  )) as number[];

  if (total.length === 0) {
    return;
  }

  return total.reduce((a, b) => a + b);
}
