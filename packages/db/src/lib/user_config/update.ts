import prisma from "$db/index.js";
import util from "node:util";

export default async (user: DiscordSnowflake, config: HibikiUserConfig) => {
  try {
    await prisma.userConfig.update({
      where: {
        user_id: user,
      },
      data: config,
    });
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
