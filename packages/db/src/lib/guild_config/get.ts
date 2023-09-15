import prisma from "$db/index.js";
import util from "node:util";

export default async (guild: DiscordSnowflake) => {
  try {
    const config: HibikiGuildConfig | null = await prisma.guildConfig.findUnique({
      where: {
        guild_id: guild,
      },
    });

    if (!config?.guild_id) return;
    return config;
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
