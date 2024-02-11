import prisma from "$db/index.js";

export default async (guild: string) => {
  try {
    const config: HibikiGuildConfig | null = await prisma.guildConfig.findUnique({
      where: {
        guild_id: guild,
      },
    });

    if (!config?.guild_id) return;
    return config;
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
