import db from "$db/client.ts";
import { guildConfig } from "$db/schema/guild_config.ts";

export default async (guild: string) => {
  try {
    await db.insert(guildConfig).values({ guild_id: guild }).onConflictDoNothing();
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
