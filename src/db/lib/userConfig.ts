/**
 * @file Database driver performing operations with user configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@/db/drizzle.js";
import { userConfig } from "@/db/schema/userConfig.js";
import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { Snowflake } from "discord.js";
import { eq } from "drizzle-orm";

/**
 * Gets a user config.
 * @param user The user's Discord user ID.
 * @returns A valid user configuration object if found.
 */

export async function getUserConfig(user: Snowflake) {
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
 * Deletes a user config.
 * @param user The user's Discord user ID.
 */

export async function deleteUserConfig(user: Snowflake) {
  try {
    await db.transaction(async (query) => {
      await query.delete(userConfig).where(eq(userConfig.user_id, user));
    });
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error deleting user config ${user}: ${error.message}`);
    captureError(error, {
      user: user,
    });
  }
}

/**
 * Updates a user config.
 * @param user The user's Discord user ID.
 * @param config A valid user configuration object.
 */

export async function updateUserConfig(user: Snowflake, config: UserConfig) {
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
    captureError(error, {
      config: config,
      user: user,
    });
  }
}

/**
 * Creates a new user config.
 * @param user The user's Discord user ID.
 */

export async function createUserConfig(user: Snowflake) {
  try {
    await db.insert(userConfig).values({ user_id: user }).onConflictDoNothing();
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error creating user config ${user}: ${error.message}`);
    captureError(error, {
      user: user,
    });
  }
}
