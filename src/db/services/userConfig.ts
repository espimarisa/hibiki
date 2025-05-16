/**
 * @file Performs database operations for user configurations.
 * @license zlib
 */

import { db } from "@/db/index.ts";
import { NOT_FOUND, redisKeys, TTL } from "@/db/redis.ts";
import type { UserConfig } from "@/db/schema/user_config.ts";
import { user_config } from "@/db/schema/user_config.ts";
import { dbLog, redisLog } from "@/utils/logger.ts";
import { redis } from "bun";
import { captureException } from "@sentry/bun";
import { eq as equals } from "drizzle-orm";

/**
 * Gets a user's user configuration.
 * @param userID The user ID to search for.
 * @returns A promise resolving to a user configuration or undefined.
 */

export async function getUserConfig(userID: string) {
  const redisKey = redisKeys.user_config(userID);

  try {
    // Searches for cached data.
    const cached = await redis.get(redisKey);

    if (cached) {
      // Checks to see if the cache is set as NOT_FOUND.
      if (cached === NOT_FOUND) {
        redisLog.debug(
          `user_config data for ${userID} is currently NOT_FOUND.`,
        );

        return;
      }

      // Parses the cached data.
      const config: UserConfig | undefined = JSON.parse(cached);

      // Ensures the ID matches the user_id.
      if (!config?.user_id || config?.user_id !== userID) {
        redisLog.warn(
          `user_config data for ${userID} has missing/mismatched user_id ${config?.user_id}.`,
        );

        // Destroys the invalid cached data.
        await redis.del(redisKey);
        return;
      }

      // Returns the cached configuration.
      redisLog.debug(`Got user_config data for ${userID}.`);
      return config;
    }

    // Searches for a configuration in the database.
    const config = await db.query.user_config.findFirst({
      where: (c, { eq }) => eq(c.user_id, userID),
    });

    if (config) {
      // Caches the configuration.
      await redis.set(redisKey, JSON.stringify(config), "EX", TTL.Day);
      redisLog.debug(`Cached user_config data for ${userID}.`);

      // Returns the configuration.
      dbLog.debug(`Got user_config data for ${userID}.`);
      return config;
    }

    // Manually sets the configuration as NOT_FOUND.
    await redis.set(redisKey, NOT_FOUND, "EX", TTL.NotFound);
    redisLog.debug(`Set user_config data for ${userID} to NOT_FOUND.`);
    return;
  } catch (err) {
    dbLog.error(err, `Failed to get user_config data for ${userID}.`);
    captureException(err, { extra: { userID: userID } });
    return;
  }
}

/**
 * Deletes a user's user configuration.
 * @param userID The user ID to delete an associated config for.
 * @returns A promise resolving to a boolean indicating success or failure.
 */

export async function deleteUserConfig(userID: string) {
  const redisKey = redisKeys.user_config(userID);

  try {
    // Attempts to delete the data.
    const result = await db
      .delete(user_config)
      .where(equals(user_config.user_id, userID))
      .returning({ deletedId: user_config.user_id });

    if (result) {
      // Destroys the cached data.
      await redis.del(redisKey);
      dbLog.debug(`Deleted user_config data for ${userID}`);
      redisLog.debug(`Deleted user_config data for ${userID}.`);
      return true;
    }
  } catch (err) {
    dbLog.error(err, `Error deleting user_id data for ${userID}.`);
    captureException(err, { extra: { userID: userID } });
    return false;
  }

  return false;
}

/**
 * Updates a user's user configuration.
 * @param userID The user ID to update an associated configuration for.
 * @param data A valid user configuration object.
 * @returns A promise resolving to an updated user configuration or undefined.
 */

export async function updateUserConfig(userID: string, data: UserConfig) {
  const redisKey = redisKeys.user_config(userID);

  // Ensures that keys are not mismatched.
  if (!data.user_id || data.user_id !== userID) {
    dbLog.warn(`Mismatched user_id ${data.user_id} for user_config ${userID}.`);
    return;
  }

  try {
    // Upserts the configuration data.
    const result = await db
      .insert(user_config)
      .values(data)
      .onConflictDoUpdate({
        set: data,
        target: user_config.user_id,
      })
      .returning();

    // Gets the final configuration object.
    const config: UserConfig | undefined = result[0];
    if (!config) {
      dbLog.error(`Upsert operation for user_config ${userID} failed.`);
      return;
    }

    // Caches and returns the new configuration.
    dbLog.debug(`Updated user_config data for ${userID}.`);
    await redis.set(redisKey, JSON.stringify(config), "EX", TTL.Day);
    redisLog.debug(`Updated user_config data for ${userID}.`);
    return config;
  } catch (err) {
    dbLog.error(err, `Error updating user_config data for ${userID}.`);
    captureException(err, { extra: { userID: userID, data: data } });
    return;
  }
}
