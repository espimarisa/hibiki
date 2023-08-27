import prisma from "$db/index.js";
import util from "node:util";

export default async (guild: DiscordSnowflake) => {
  try {
    await prisma.guildConfig.upsert({
      where: {
        guild_id: guild,
      },
      update: {
        guild_id: guild,
      },
      create: {
        guild_id: guild,
      },
    });
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
