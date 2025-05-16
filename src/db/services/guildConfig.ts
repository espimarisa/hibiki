/**
 * @file Performs database operations for guild configurations.
 * @license zlib
 */

import { db } from "@/db/index.ts";
import { NOT_FOUND, redisKeys, TTL } from "@/db/redis.ts";
import type { GuildConfig } from "@/db/schema/guild_config.ts";
import { guild_config } from "@/db/schema/guild_config.ts";
import { dbLog, redisLog } from "@/utils/logger.ts";
import { redis } from "bun";
import { captureException } from "@sentry/bun";
import { eq as equals } from "drizzle-orm";

/**
 * Gets a guild configuration.
 * @param guildID The guild ID to search for.
 * @returns A promise resolving to a guild configuration or undefined.
 */

export async function getGuildConfig(guildID: string) {
  const redisKey = redisKeys.guild_config(guildID);

  try {
    // Searches for cached data.
    const cached = await redis.get(redisKey);

    if (cached) {
      // Checks to see if the cache is set as NOT_FOUND.
      if (cached === NOT_FOUND) {
        redisLog.debug(
          `guild_config data for ${guildID} is currently NOT_FOUND.`,
        );

        return;
      }

      // Parses the cached data.
      const config = JSON.parse(cached) as GuildConfig;

      // Ensures the ID matches the guild_id.
      if (!config?.guild_id || config?.guild_id !== guildID) {
        redisLog.warn(
          `guild_config data for ${guildID} has missing/mismatched guild_id ${config?.guild_id}.`,
        );

        // Destroys the invalid cached data.
        await redis.del(redisKey);
        return;
      }

      // Returns the cached configuration.
      redisLog.debug(`Got guild_config data for ${guildID}.`);
      return config;
    }

    // Searches for a configuration in the database.
    const config = await db.query.guild_config.findFirst({
      where: (c, { eq }) => eq(c.guild_id, guildID),
    });

    if (config) {
      // Caches the configuration.
      await redis.set(redisKey, JSON.stringify(config), "EX", TTL.Day);
      redisLog.debug(`Cached guild_config data for ${guildID}.`);

      // Returns the configuration.
      dbLog.debug(`Got guild_config data for ${guildID}.`);
      return config as GuildConfig;
    }

    // Manually sets the configuration as NOT_FOUND.
    await redis.set(redisKey, NOT_FOUND, "EX", TTL.NotFound);
    redisLog.debug(`Set guild_config data for ${guildID} to NOT_FOUND.`);
    return;
  } catch (err) {
    dbLog.error(err, `Failed to get guild_config data for ${guildID}.`);
    captureException(err, { extra: { guildID: guildID } });
    return;
  }
}

/**
 * Deletes a guild configuration.
 * @param guildID The guild ID to delete an associated config for.
 * @returns A promise resolving to a boolean indicating success or failure.
 */

export async function deleteGuildConfig(guildID: string) {
  const redisKey = redisKeys.guild_config(guildID);

  try {
    // Attempts to delete the data.
    const result = await db
      .delete(guild_config)
      .where(equals(guild_config.guild_id, guildID))
      .returning({ deletedId: guild_config.guild_id });

    if (result) {
      // Destroys the cached data.
      await redis.del(redisKey);
      dbLog.debug(`Deleted guild_config data for ${guildID}`);
      redisLog.debug(`Deleted guild_config data for ${guildID}.`);
      return true;
    }
  } catch (err) {
    dbLog.error(err, `Error deleting guild_id data for ${guildID}.`);
    captureException(err, { extra: { guildID: guildID } });
    return false;
  }

  return false;
}

/**
 * Updates a guild configuration.
 * @param guildID The guild ID to update an associated configuration for.
 * @param data A valid guild configuration object.
 * @returns A promise resolving to an updated guild configuration or undefined.
 */

export async function updateGuildConfig(guildID: string, data: GuildConfig) {
  const redisKey = redisKeys.guild_config(guildID);

  // Ensures that keys are not mismatched.
  if (!data.guild_id || data.guild_id !== guildID) {
    dbLog.warn(
      `Mismatched guild_id ${data.guild_id} for guild_config ${guildID}.`,
    );
    return;
  }

  try {
    // Upserts the configuration data.
    const result = await db
      .insert(guild_config)
      .values(data)
      .onConflictDoUpdate({
        set: data,
        target: guild_config.guild_id,
      })
      .returning();

    // Gets the final configuration object.
    const config: GuildConfig | undefined = result[0];
    if (!config) {
      dbLog.error(`Upsert operation for guild_config ${guildID} failed.`);
      return;
    }

    // Caches and returns the new configuration.
    dbLog.debug(`Updated guild_config data for ${guildID}.`);
    await redis.set(redisKey, JSON.stringify(config), "EX", TTL.Day);
    redisLog.debug(`Updated guild_config data for ${guildID}.`);
    return config;
  } catch (err) {
    dbLog.error(err, `Error updating guild_config data for ${guildID}.`);
    captureException(err, { extra: { guildID: guildID, data: data } });
    return;
  }
}
