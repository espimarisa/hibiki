/**
 * @file Performs CRUD operations on guild configurations.
 * @license Zlib
 */

import { db } from "@/db/index.ts";
import { NOT_FOUND, redisKeys, TTL } from "@/db/redis.ts";
import { type GuildConfig, guild_config } from "@/db/schema/guild_config.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { dbLog, redisLog } from "@/utils/logger.ts";
import { redis } from "bun";
import { eq } from "drizzle-orm";

/**
 * Gets a guild configuration.
 * @param guildID The guild ID to search for.
 * @returns A guild configuration.
 */

export async function getGuildConfig(guildID: string) {
  const redisKey = redisKeys.guild_config(guildID);

  try {
    // Searches for cached data.
    const cached = await redis.get(redisKey);

    if (cached) {
      // Checks to see if the cache is set as NOT_FOUND.
      if (cached === NOT_FOUND) {
        redisLog.debug(`Guild ${guildID} is in the NOT_FOUND status.`);
        return;
      }

      // Parses the cached data.
      const config = JSON.parse(cached) as GuildConfig;

      // Ensures the ID matches the guild_id.
      if (!config?.guild_id || config?.guild_id !== guildID) {
        redisLog.warn(
          `Guild ${guildID} has missing/mismatched guild_id ${config?.guild_id}.`,
        );

        // Destroys the invalid cached data.
        await redis.del(redisKey);
        return;
      }

      // Returns the cached configuration.
      redisLog.debug(`Found cached guild_config for ${guildID}.`);
      return config;
    }

    // Searches for a configuration in the database.
    const config = await db.query.guild_config.findFirst({
      where: (config, { eq }) => eq(config.guild_id, guildID),
    });

    if (config) {
      // Caches the configuration.
      await redis.set(redisKey, JSON.stringify(config), "EX", TTL.Day);
      redisLog.debug(`Cached guild_config for ${guildID}.`);

      // Returns the configuration.
      dbLog.debug(`Got guild_config for ${guildID}.`);
      return config as GuildConfig;
    }

    // Manually sets the configuration as NOT_FOUND.
    await redis.set(redisKey, NOT_FOUND, "EX", TTL.NotFound);
    redisLog.debug(`Set guild_config for ${guildID} to NOT_FOUND.`);
    return;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(`Failed to get guild_config for ${guildID}: ${error.message}`);
    captureError(error, { guildID: guildID });
    return;
  }
}

/**
 * Deletes a guild configuration.
 * @param guildID The guild ID to delete an associated config for.
 * @returns A boolean indicating success or failure.
 */

export async function deleteGuildConfig(guildID: string) {
  const redisKey = redisKeys.guild_config(guildID);

  try {
    // Attempts to delete the data.
    const result = await db
      .delete(guild_config)
      .where(eq(guild_config.guild_id, guildID))
      .returning({ deletedId: guild_config.guild_id });

    if (result) {
      // Destroys the cached data.
      await redis.del(redisKey);
      dbLog.debug(`Deleted guild_config for ${guildID}`);
      redisLog.debug(`Deleted cached guild_config for ${guildID}.`);
      return true;
    }
  } catch (err) {
    const error = parseError(err);
    dbLog.error(`Error deleting guild_id ${guildID}: ${error.message}`);
    captureError(error, { guildID: guildID });
  }

  return false;
}

/**
 * Updates a guild configuration.
 * @param guildID The guild ID to update an associated configuration for.
 * @param data A valid guild configuration object.
 * @returns An updated guild configuration.
 */

export async function updateGuildConfig(guildID: string, data: GuildConfig) {
  const redisKey = redisKeys.guild_config(guildID);

  // Ensures that keys are not mismatched.
  if (!data.guild_id || data.guild_id !== guildID) {
    const errorMessage = `Mismatched guild_id ${data.guild_id} for ${guildID}.`;
    dbLog.error(errorMessage);
    captureError(errorMessage, { guildID: guildID, data });
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
    const config = result[0];
    if (!config) {
      dbLog.error(`Upsert operation for ${guildID} failed.`);
      return;
    }

    // Caches and returns the new configuration.
    dbLog.debug(`Updated guild_config for guild ${guildID}.`);
    await redis.set(redisKey, JSON.stringify(config), "EX", TTL.Day);
    redisLog.debug(`Updated cached guild_config for ${guildID}.`);
    return config as GuildConfig;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(`Error updating guild_config for ${guildID}: ${error.message}`);
    captureError(error, { guildID: guildID, data: data });
    return;
  }
}
