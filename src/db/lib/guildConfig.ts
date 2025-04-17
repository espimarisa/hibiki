/**
 * @file Database driver performing operations with guild configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@/db/drizzle.js";
import { guildConfig } from "@/db/schema/guildConfig.js";
import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { Snowflake } from "discord.js";
import { eq } from "drizzle-orm";

/**
 * Gets a guild config.
 * @param guild The guild's Discord guild ID.
 * @returns A valid guild configuration object if found.
 */

export async function getGuildConfig(guild: Snowflake) {
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
 * Deletes a guild config.
 * @param guild The guild's Discord guild ID.
 */

export async function deleteGuildConfig(guild: Snowflake) {
  try {
    await db.transaction(async (query) => {
      await query.delete(guildConfig).where(eq(guildConfig.guild_id, guild));
    });
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error deleting guild config ${guild}: ${error.message}`);
    captureError(error, {
      guild: guild,
    });
  }
}

/**
 * Updates a guild config.
 * @param guild The guild's Discord guild ID.
 * @param config A valid guild configuration object.
 */

export async function updateGuildConfig(guild: Snowflake, config: GuildConfig) {
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
    captureError(error, {
      config: config,
      guild: guild,
    });
  }
}

/**
 * Creates a new guild config.
 * @param guild The guild's Discord guild ID.
 */

export async function createGuildConfig(guild: Snowflake) {
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
    captureError(error, {
      guild: guild,
    });
  }
}
