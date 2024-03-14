import db from "$db/client.ts";
import { getGuildConfig } from "$db/index.ts";
import { guildConfig } from "$db/schema/guild_config.ts";
import { eq } from "drizzle-orm";

export default async (guild: string, config: HibikiGuildConfig) => {
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
};
