import prisma from "$db/index.js";
import util from "node:util";

export default async (guild: DiscordSnowflake) => {
  try {
    // Deletes the entry
    await prisma.guildConfig.delete({
      where: {
        guild_id: guild,
      },
    });
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
