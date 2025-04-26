/**
 * @file Drizzle database driver interacting with user configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@db/index.js";
import { userConfig } from "@db/schema/userConfig.js";
import { captureError, parseError } from "@utils/error.js";
import { logger } from "@utils/logger.js";
import { eq } from "drizzle-orm";

/**
 * Gets a Hibiki user configuration object by user ID.
 * @param user The unique Discord user ID to get a matching configuration for.
 * @returns A valid Hibiki user configuration object.
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
  try {
    await db.transaction(async (query) => {
      await query.delete(userConfig).where(eq(userConfig.user_id, user));
    });

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
  try {
    // Checks for an existing config
    const existingConfig = await getUserConfig(user);

    // Update if exists, else insert
    await (existingConfig?.user_id
      ? db.update(userConfig).set(config).where(eq(userConfig.user_id, user))
      : db.insert(userConfig).values(config).onConflictDoNothing());

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
