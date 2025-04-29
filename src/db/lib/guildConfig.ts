/**
 * @file Drizzle database driver interacting with guild configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { db } from "@/db/index.js";
import { redis } from "@/db/redis.js";
import {
  guildConfig,
  type HibikiGuildConfig,
} from "@/db/schema/guildConfig.js";
import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import { eq } from "drizzle-orm";

/**
 * Gets a Hibiki guild configuration object by guild ID.
 * @param guild The unique Discord guild ID to get a matching configuration for.
 * @returns A valid Hibiki guild configuration object.
 */

export async function getGuildConfig(guild: string) {
  const redisKey = `guild:${guild}`;
  let config: HibikiGuildConfig | undefined;

  try {
    // Checks for a cached result
    const cached = await redis.get(redisKey);

    // Uses the cached result if it exists
    if (cached) {
      config = JSON.parse(cached);
    } else {
      config = await db.query.guildConfig.findFirst({
        where: (guildConfig, { eq }) => eq(guildConfig.guild_id, guild),
      });
    }

    if (!config?.guild_id) {
      return;
    }

    // Updates the cache
    if (!cached) {
      await redis.set(redisKey, JSON.stringify(config));
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
  const redisKey = `guild:${guild}`;

  try {
    await db.transaction(async (query) => {
      await query.delete(guildConfig).where(eq(guildConfig.guild_id, guild));
    });

    // Deletes the cached guild data
    const cached = await redis.get(redisKey);
    if (cached) {
      await redis.del(redisKey);
    }

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
  const redisKey = `guild:${guild}`;
  let existingConfig: HibikiGuildConfig | undefined;

  try {
    // Checks for an existing config
    const cached = await redis.get(redisKey);

    if (cached) {
      existingConfig = JSON.parse(cached);
    } else {
      existingConfig = await getGuildConfig(guild);
    }

    // Update if exists, else insert
    await (existingConfig?.guild_id
      ? db
          .update(guildConfig)
          .set(config)
          .where(eq(guildConfig.guild_id, guild))
      : db.insert(guildConfig).values(config).onConflictDoNothing());

    // Updates the cached data
    await redis.set(redisKey, JSON.stringify(guildConfig));
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
