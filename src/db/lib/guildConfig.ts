/**
 * @file Database driver performing operations with guild configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@/db/index.js";
import { guildConfig } from "@/db/schema/guildConfig.js";
import { parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import { eq } from "drizzle-orm";

/**
 * Gets a guild config.
 * @param guild The guild ID search for a matching config with.
 * @returns A guild config.
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
    throw error;
  }
}

/**
 * Deletes a guild config.
 * @param guild The guild ID to delete a matching config with.
 */

export async function deleteGuildConfig(guild: string) {
  try {
    await db.transaction(async (query) => {
      await query.delete(guildConfig).where(eq(guildConfig.guild_id, guild));
    });
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error deleting guild config ${guild}: ${error.message}`);
    throw error;
  }
}

/**
 * Updates a guild config.
 * @param guild The guild ID to update a matching config with.
 * @param config A valid guild config object.
 */

export async function updateGuildConfig(guild: string, config: GuildConfig) {
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
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error updating guild config ${guild}: ${error.message}`);
    throw error;
  }
}

/**
 * Creates a blank guild config.
 * @param guild The guild ID to create a config for.
 */

export async function createBlankGuildConfig(guild: string) {
  // Checks to see if the guild config exists
  const config = await getGuildConfig(guild);
  if (config) {
    return;
  }

  try {
    await db
      .insert(guildConfig)
      .values({ guild_id: guild })
      .onConflictDoNothing();
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error creating guild config ${guild}: ${error.message}`);
    throw error;
  }
}
