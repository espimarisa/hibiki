import prisma from "$db/index.ts";

export default async (guild: string) => {
  try {
    // Deletes the entry
    await prisma.guildConfig.delete({
      where: {
        guild_id: guild,
      },
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
