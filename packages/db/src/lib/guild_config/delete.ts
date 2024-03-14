import db from "$db/client.ts";
import { guildConfig } from "$db/schema/guild_config.ts";
import { eq } from "drizzle-orm";

export default async (guild: string) => {
  try {
    await db.transaction(async (query) => {
      await query.delete(guildConfig).where(eq(guildConfig.guild_id, guild));
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
