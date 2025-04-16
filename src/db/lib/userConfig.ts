/**
 * @file Database driver performing operations with user configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@/db/index.js";
import { userConfig } from "@/db/schema/userConfig.js";
import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import { eq } from "drizzle-orm";

/**
 * Gets a user config.
 * @param user The user ID search for a matching config with.
 * @returns A user config.
 */

export async function getUserConfig(user: string) {
  try {
    const config = await db.query.userConfig.findFirst({
      where: (userConfig, { eq }) => eq(userConfig.user_id, user),
    });

    if (!config?.user_id) {
      return;
    }

    return config;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error getting user config ${user}: ${error.message}`);

    // Captures the error with Sentry
    captureError(error, {
      user: user,
    });
  }

  return;
}

/**
 * Deletes a user config.
 * @param user The user ID to delete a matching config with.
 */

export async function deleteUserConfig(user: string) {
  try {
    await db.transaction(async (query) => {
      await query.delete(userConfig).where(eq(userConfig.user_id, user));
    });
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error deleting user config ${user}: ${error.message}`);

    // Captures the error with Sentry
    captureError(error, {
      user: user,
    });
  }

  return;
}

/**
 * Updates a user config.
 * @param user The user ID to update a matching config with.
 * @param config A valid user config object.
 */

export async function updateUserConfig(user: string, config: UserConfig) {
  try {
    // Checks for an existing config
    const existingConfig = await getUserConfig(user);

    // Update if exists, else insert
    await (existingConfig?.user_id
      ? db.update(userConfig).set(config).where(eq(userConfig.user_id, user))
      : db.insert(userConfig).values(config).onConflictDoNothing());
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error updating user config ${user}: ${error.message}`);

    // Captures the error with Sentry
    captureError(error, {
      config: config,
      user: user,
    });
  }

  return;
}

/**
 * Creates a blank user config.
 * @param user The user ID to create a config for.
 */

export async function createBlankUserConfig(user: string) {
  try {
    await db.insert(userConfig).values({ user_id: user }).onConflictDoNothing();
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error creating user config ${user}: ${error.message}`);

    // Captures the error with Sentry
    captureError(error, {
      user: user,
    });
  }

  return;
}
