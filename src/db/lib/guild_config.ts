import { db } from "$db/db.ts";
import { guildConfig } from "$db/schema/guild_config.ts";
import type { HibikiGuildConfig } from "$db/typings/index.d.ts";
import { eq } from "drizzle-orm";

// Gets a guild config
export async function getGuildConfig(guild: string) {
  try {
    const config = await db.query.guildConfig.findFirst({
      where: (guildConfig, { eq }) => eq(guildConfig.guild_id, guild),
    });

    if (!config?.guild_id) {
      return;
    }

    return config;
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}

// Deletes a guild config
export async function deleteGuildConfig(guild: string) {
  try {
    await db.transaction(async (query) => {
      await query.delete(guildConfig).where(eq(guildConfig.guild_id, guild));
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}

// Updates or inserts a guild config
export async function updateGuildConfig(guild: string, config: HibikiGuildConfig) {
  try {
    // Checks for an existing config
    const existingConfig = await getGuildConfig(guild);

    // Update if exists, else insert
    await (existingConfig?.guild_id
      ? db.update(guildConfig).set(config).where(eq(guildConfig.guild_id, guild))
      : db.insert(guildConfig).values(config).onConflictDoNothing());
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}

// Creates a blank guild config
export async function createBlankGuildConfig(guild: string) {
  try {
    await db.insert(guildConfig).values({ guild_id: guild }).onConflictDoNothing();
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}
