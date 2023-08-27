import prisma from "$db/index.js";
import util from "node:util";

export default async (user: DiscordSnowflake) => {
  const config = await prisma.userConfig.findUnique({
    where: {
      user_id: user,
    },
  });

  if (!config?.user_id) return;

  try {
    // Parses the config and returns it
    const parsedConfig = JSON.stringify(config);
    if (!parsedConfig) return;
    return parsedConfig as unknown as HibikiUserConfig;
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
