/**
 * @file Drizzle database driver interacting with guild configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@db/index.js";
import { guildConfig } from "@db/schema/guildConfig.js";
import { captureError, parseError } from "@utils/error.js";
import { logger } from "@utils/logger.js";
import { eq } from "drizzle-orm";

/**
 * Gets a Hibiki guild configuration object by guild ID.
 * @param guild The unique Discord guild ID to get a matching configuration for.
 * @returns A valid Hibiki guild configuration object.
 */

export async function getGuildConfig(guild: string) {
  try {
    const config = await db.query.guildConfig.findFirst({
      where: (guildConfig, { eq }) => eq(guildConfig.guild_id, guild),
    });

    if (!config?.guild_id) {
      return;
    }

    return config;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error getting guild config ${guild}: ${error.message}`);
    captureError(error, {
      guild: guild,
    });

    return;
  }
}

/**
 * Deletes a Hibiki guild configuration object by guild ID.
 * @param guild The unique Discord guild ID to delete a configuration for.
 * @returns A boolean indicating success or failure.
 */

export async function deleteGuildConfig(guild: string) {
  try {
    await db.transaction(async (query) => {
      await query.delete(guildConfig).where(eq(guildConfig.guild_id, guild));
    });

    return true;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error deleting guild config ${guild}: ${error.message}`);
    captureError(error, {
      guild: guild,
    });

    return false;
  }
}

/**
 * Updates a Hibiki guild configuration object by guild ID.
 * @param guild The unique Discord guild ID to delete a configuration for.
 * @param config A valid Hibiki guild configuration object to insert.
 * @returns A boolean indicating success or failure.
 */

export async function updateGuildConfig(
  guild: string,
  config: HibikiGuildConfig,
) {
  try {
    // Checks for an existing config
    const existingConfig = await getGuildConfig(guild);

    // Update if exists, else insert
    await (existingConfig?.guild_id
      ? db
          .update(guildConfig)
          .set(config)
          .where(eq(guildConfig.guild_id, guild))
      : db.insert(guildConfig).values(config).onConflictDoNothing());

    return true;
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error updating guild config ${guild}: ${error.message}`);
    captureError(error, {
      config: config,
      guild: guild,
    });

    return false;
  }
}
