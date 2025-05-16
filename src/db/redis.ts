/**
 * @file Primary Redis database client and utilities.
 * @license zlib
 */

import { env } from "@/utils/env.ts";
import { RedisClient } from "bun";

// Explicit string for not found Redis queries.
export const NOT_FOUND = "__NOT_FOUND__";

// Commonly used TTL values, in seconds.
export enum TTL {
  Day = 86_400,
  Hour = 3600,
  Minute = 60,
  NotFound = 300,
}

// Keys allowed for Redis queries.
export const redisKeys = {
  /**
   * Redis key for storing guild_config data.
   * @param guildID The Discord guild ID to use for the Redis query.
   * @returns A Redis key formatted as guild_config:guildID.
   */

  guild_config: (guildID: string) => `guild_config:${guildID}`,

  /**
   * Redis key for storing star_count data.
   * @param userID The Discord user ID of the user.
   * @returns A Redis key formatted as star_count:userID.
   */

  star_count: (userID: string) => `star_count:${userID}`,

  /**
   * Redis key for storing star_entry data.
   * @param starID The Discord message ID of the starboard entry message.
   * @returns A Redis key formatted as star_entry:starID.
   */

  star_entry: (starID: string) => `star_entry:${starID}`,

  /**
   * Redis key for storing star_user data.
   * @param messageID The Discord message ID of the starred message.
   * @param userID The Discord user ID of the user.
   * @returns A Redis key formatted as star_user:messageID:userID.
   */

  star_user: (messageID: string, userID: string) =>
    `star_user:${messageID}:${userID}`,

  /**
   * Redis key for storing user_config data.
   * @param userID The Discord user ID to use for the Redis query.
   * @returns A Redis key formatted as user_config:userID.
   */

  user_config: (userID: string) => `user_config:${userID}`,
} as const;

// Creates a new Redis client.
export const redis = new RedisClient(env.REDIS_URL);
