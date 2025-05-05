/**
 * @file Performs CRUD operations on guild configurations.
 * @license Zlib
 */

import { db } from "@/db/index.ts";
import { type GuildConfig, guild_config } from "@/db/schema/guild_config.ts";
import { Durations } from "@/utils/constants.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { logger } from "@/utils/logger.ts";
import { redis } from "bun";
import { eq } from "drizzle-orm";

const NOT_FOUND = "__NOT_FOUND__";
const NOT_FOUND_TTL = Durations.Minute * 5;

// Logging prefixes.
const LOG_REDIS = "Redis (guild_config):";
const LOG_DB = "DB (guild_config):";

// Redis keys to use for caching.
const redisKeys = {
  guild_config: (id: string) => `guild_config:${id}`,
};

/**
 * Gets a guild configuration.
 * @param id The guild ID to search for.
 * @returns A guild configuration.
 */

export async function getGuildConfig(id: string) {
  const redisKey = redisKeys.guild_config(id);
  let config: GuildConfig | null;

  try {
    // Searches for cached data.
    const cached = await redis.get(redisKey);

    if (cached) {
      // Checks to see if the cache is set as NOT_FOUND.
      if (cached === NOT_FOUND) {
        logger.debug(`${LOG_REDIS} ${id} not found.`);
        return null;
      }

      try {
        // Parses the cached data.
        config = JSON.parse(cached);

        // Ensures the ID matches the guild_id.
        if (config?.guild_id !== id) {
          logger.warn(
            `${LOG_REDIS} ${id} has mismatched guild_id ${config?.guild_id}.`,
          );

          // Destroys the invalid cached data.
          await redis.del(redisKey);
          config = null;
        } else {
          logger.debug(`${LOG_REDIS} ${id} found.`);
          return config;
        }
      } catch (err) {
        const error = parseError(err);
        logger.warn(`${LOG_REDIS} ${id} failed to parse: ${error.message}.`);
        captureError(error, { extra: { cache: cached, guild: id } });
        config = null;
      }
    } else {
      logger.debug(`${LOG_REDIS} ${id} not cached.`);
    }

    // Searches for a configuration in the database.
    const result = await db.query.guild_config.findFirst({
      where: (config, { eq }) => eq(config.guild_id, id),
    });

    // Sets the config.
    config = result ?? null;

    if (config) {
      // Caches the found configuration.
      await redis.set(redisKey, JSON.stringify(config), "EX", Durations.Day);
      logger.debug(`${LOG_REDIS} ${id} cached.`);
    } else {
      // Manually sets the configuration as NOT_FOUND for performance reasons.
      await redis.set(redisKey, NOT_FOUND, "EX", NOT_FOUND_TTL);
      logger.debug(`${LOG_REDIS} ${id} set to NOT_FOUND status.`);
    }

    return config;
  } catch (err) {
    const error = parseError(err);
    logger.error(`${LOG_DB} Error getting ${id}: ${error.message}`);
    captureError(error, { context: { guild: id } });
    return null;
  }
}

/**
 * Deletes a guild configuration.
 * @param id The guild ID to delete an associated config for.
 * @returns A boolean indicating success or failure.
 */

export async function deleteGuildConfig(id: string) {
  const redisKey = redisKeys.guild_config(id);

  try {
    // Attempts to delete the data.
    const result = await db
      .delete(guild_config)
      .where(eq(guild_config.guild_id, id))
      .returning({ deletedId: guild_config.guild_id });

    if (result.length > 0) {
      logger.info(`${LOG_DB} ${id} deleted.`);
    } else {
      logger.info(`${LOG_DB} Attempted to delete ${id}, doesn't exist.`);
    }

    // Destroys the cached data.
    const deleted = await redis.del(redisKey);
    logger.debug(`${LOG_REDIS} Invalidated ${redisKey}. Total: ${deleted}`);
    return true;
  } catch (err) {
    const error = parseError(err);
    logger.error(`${LOG_DB} Error deleting ${id}: ${error.message}`);
    captureError(error, { context: { guild: id } });
    return false;
  }
}

/**
 * Updates a guild configuration.
 * @param id The guild ID to update an associated configuration for.
 * @param data An object containing the fields to update. Must include guild_id.
 * @returns An updated guild configuration.
 */

export async function updateGuildConfig(
  id: string,
  data: Partial<GuildConfig>,
) {
  const redisKey = redisKeys.guild_config(id);

  // Ensures that keys are not mismatched.
  if (!data.guild_id || data.guild_id !== id) {
    const errorMessage = "Missing or mismatched guild ID in updateGuildConfig";
    logger.error(
      `${LOG_DB} ${errorMessage}: Param ${id}, Data: ${data.guild_id ?? "MISSING"}`,
    );

    // Captures the error with Sentry.
    captureError(new Error(errorMessage), { context: { guild: id, data } });
    return null;
  }

  // Creates an object to perform operations on.
  const { id: inputUUID, guild_id: validatedGuildId, ...otherData } = data;

  // Explicitly type the object to ensure guild_id is non-optional.
  const dataForInsert: { guild_id: string } & Partial<
    Omit<GuildConfig, "id" | "guild_id">
  > = {
    guild_id: validatedGuildId,
    ...otherData,
  };

  try {
    // Creates the upsert query.
    const upsertQuery = db
      .insert(guild_config)
      .values(dataForInsert)
      .onConflictDoUpdate({
        set: otherData,
        target: guild_config.guild_id,
      })
      .returning();

    // Gets the upsert result and final configuration object.
    const upsertResult = await upsertQuery;
    const finalConfig = upsertResult[0];
    if (!finalConfig) {
      throw new Error("Upsert operation failed to return.");
    }

    // Caches the new configuration.
    logger.info(`${LOG_DB} Upserted guild config for guild ${id}`);
    await redis.set(redisKey, JSON.stringify(finalConfig), "EX", Durations.Day);
    logger.debug(`${LOG_REDIS} ${id} updated.`);

    // Returns the new configuration.
    return finalConfig;
  } catch (err) {
    const error = parseError(err);
    logger.error(`${LOG_DB} Error upserting {id}: ${error.message}`);
    captureError(error, { context: { guild: id, data: data } });
    return null;
  }
}
