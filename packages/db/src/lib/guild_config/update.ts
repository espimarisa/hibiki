import prisma from "$db/index.js";
import util from "node:util";

export default async (guild: DiscordSnowflake, config: HibikiGuildConfig) => {
  try {
    await prisma.guildConfig.update({
      where: {
        guild_id: guild,
      },
      data: config,
    });
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
