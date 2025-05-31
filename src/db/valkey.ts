/**
 * @file Primary Valkey database client and utilities.
 * @license zlib
 */

import { RedisClient as ValkeyClient } from "bun";
import { env } from "@/utils/env.ts";

// Explicit string for not found Valkey queries.
export const NOT_FOUND = "__NOT_FOUND__";

// Commonly used TTL values, in seconds.
export enum TTL {
  Second = 1,
  Minute = Second * 60,
  Hour = Minute * 60,
  Day = Hour * 24,
  NotFound = Minute * 5,
}

// Keys allowed for Valkey queries.
export const valkeyKeys = {
  /**
   * Valkey key for storing guild_config data.
   * @param guildID The Discord guild ID to use for the Valkey query.
   * @returns A Valkey key formatted as guild_config:guildID.
   */

  guild_config: (guildID: string) => `guild_config:${guildID}`,

  /**
   * Valkey key for storing star_count data.
   * @param userID The Discord user ID of the user.
   * @returns A Valkey key formatted as star_count:userID.
   */

  star_count: (userID: string) => `star_count:${userID}`,

  /**
   * Valkey key for storing star_entry data.
   * @param starID The Discord message ID of the starboard entry message.
   * @returns A Valkey key formatted as star_entry:starID.
   */

  star_entry: (starID: string) => `star_entry:${starID}`,

  /**
   * Valkey key for storing star_user data.
   * @param messageID The Discord message ID of the starred message.
   * @param userID The Discord user ID of the user.
   * @returns A Valkey key formatted as star_user:messageID:userID.
   */

  star_user: (messageID: string, userID: string) =>
    `star_user:${messageID}:${userID}`,

  /**
   * Valkey key for storing user_config data.
   * @param userID The Discord user ID to use for the Valkey query.
   * @returns A Valkey key formatted as user_config:userID.
   */

  user_config: (userID: string) => `user_config:${userID}`,
} as const;

// Creates a new Valkey client.
export const valkey = new ValkeyClient(env.VALKEY_URL);
