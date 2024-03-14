import db from "$db/client.ts";

export default async (guild: string) => {
  try {
    const config = await db.query.guildConfig.findFirst({
      where: (guildConfig, { eq }) => eq(guildConfig.guild_id, guild),
    });

    if (!config?.guild_id) return;
    return config;
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
