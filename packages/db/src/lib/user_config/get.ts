import prisma from "$db/index.js";
import util from "node:util";

export default async (user: DiscordSnowflake) => {
  try {
    const config: HibikiUserConfig | null = await prisma.userConfig.findUnique({
      where: {
        user_id: user,
      },
    });

    if (!config?.user_id) return;
    return config;
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
