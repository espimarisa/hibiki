/**
 * @file Redis client and utilities.
 * @license Zlib
 */

import { env } from "@/utils/env.ts";
import { RedisClient } from "bun";

// Creates a new Redis client.
export const redis = new RedisClient(env.REDIS_URL);

// Explicit string for not found Redis queries.
export const NOT_FOUND = "__NOT_FOUND__";

// TTL values, in seconds.
export enum TTL {
  NotFound = 300,
  Day = 86400,
  Minute = 60,
  FiveMinutes = 60 * 5,
  Hour = 3600,
}

// Keys used for caching.
export const redisKeys = {
  // Cached guild config.
  guild_config: (guildID: string) => `guild_config:${guildID}`,

  // Cached star count on a message.
  star_count: (messageID: string) => `star_count:${messageID}`,

  // Cached star entry.
  star_entry: (messageID: string) => `star_entry:${messageID}`,

  // Cached star user.
  star_user: (messageID: string, userID: string) =>
    `star_user:${messageID}:${userID}`,

  // Cached user config.
  user_config: (userID: string) => `user_config:${userID}`,
};
