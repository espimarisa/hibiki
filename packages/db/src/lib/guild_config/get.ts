import prisma from "$db/index.js";
import util from "node:util";

export default async (guild: string) => {
  const config = await prisma.guildConfig.findUnique({
    where: {
      guild_id: guild,
    },
  });

  if (!config?.guild_id) return;

  try {
    // Parses the config and returns it
    const parsedConfig = JSON.stringify(config);
    if (!parsedConfig) return;
    return parsedConfig as unknown as HibikiGuildConfig;
  } catch (error) {
    throw new Error(util.inspect(error));
  }
};
