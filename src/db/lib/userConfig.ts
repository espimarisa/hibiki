/**
 * @file Drizzle database driver interacting with user configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@/db/index.js";
import { redis } from "@/db/redis.js";
import { type HibikiUserConfig, userConfig } from "@/db/schema/userConfig.js";
import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import { eq } from "drizzle-orm";

/**
 * Gets a Hibiki user configuration object by user ID.
 * @param user The unique Discord user ID to get a matching configuration for.
 * @returns A valid Hibiki user configuration object.
 */

export async function getUserConfig(user: string) {
  const redisKey = `user:${user}`;
  let config: HibikiUserConfig | undefined;

  try {
    // Checks for a cached result
    const cached = await redis.get(redisKey);

    // Uses the cached result if it exists
    if (cached) {
      config = JSON.parse(cached) satisfies HibikiUserConfig;
    } else {
      // Fetches the config in the database
      config = await db.query.userConfig.findFirst({
        where: (userConfig, { eq }) => eq(userConfig.user_id, user),
      });
    }

    if (!config?.user_id) {
      return;
    }

    // Updates the cache
    if (!cached) {
      await redis.set(redisKey, JSON.stringify(config));
    }

    return config;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error getting user config ${user}: ${error.message}`);
    captureError(error, {
      user: user,
    });

    return;
  }
}

/**
 * Deletes a Hibiki user configuration object by user ID.
 * @param user The unique Discord user ID to delete a configuration for.
 * @returns A boolean indicating success or failure.
 */

export async function deleteUserConfig(user: string) {
  const redisKey = `user:${user}`;

  try {
    await db.transaction(async (query) => {
      await query.delete(userConfig).where(eq(userConfig.user_id, user));
    });

    // Deletes the cached user data
    const cached = await redis.get(redisKey);
    if (cached) {
      await redis.del(redisKey);
    }

    return true;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error deleting user config ${user}: ${error.message}`);
    captureError(error, {
      user: user,
    });

    return false;
  }
}

/**
 * Updates a Hibiki user configuration object by user ID.
 * @param guild The unique Discord user ID to delete a configuration for.
 * @param config A valid Hibiki user configuration object to insert.
 * @returns A boolean indicating success or failure.
 */

export async function updateUserConfig(user: string, config: HibikiUserConfig) {
  const redisKey = `user:${user}`;
  let existingConfig: HibikiUserConfig | undefined;

  try {
    // Checks for an existing config
    const cached = await redis.get(redisKey);

    if (cached) {
      existingConfig = JSON.parse(cached) satisfies HibikiUserConfig;
    } else {
      existingConfig = await getUserConfig(user);
    }

    // Update if exists, else insert
    await (existingConfig?.user_id
      ? db.update(userConfig).set(config).where(eq(userConfig.user_id, user))
      : db.insert(userConfig).values(config).onConflictDoNothing());

    // Updates the cached data
    await redis.set(redisKey, JSON.stringify(userConfig));
    return true;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error updating user config ${user}: ${error.message}`);
    captureError(error, {
      config: config,
      user: user,
    });

    return false;
  }
}
