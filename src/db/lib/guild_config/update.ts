import prisma from "$db/index.js";

export default async (guild: string, config: HibikiGuildConfig) => {
  try {
    await prisma.guildConfig.update({
      where: {
        guild_id: guild,
      },
      data: config,
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
