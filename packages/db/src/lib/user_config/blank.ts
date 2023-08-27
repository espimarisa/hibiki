import prisma from "$db/index.js";
import util from "node:util";

export default async (user: DiscordSnowflake) => {
  try {
    await prisma.userConfig.upsert({
      where: {
        user_id: user,
      },
      update: {
        user_id: user,
      },
      create: {
        user_id: user,
      },
    });
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
