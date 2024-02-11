import prisma from "$db/index.js";

export default async (guild: string) => {
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
    throw new Error(Bun.inspect(error));
  }
};
