import prisma from "$db/index.ts";

export default async (user: string, config: HibikiUserConfig) => {
  try {
    await prisma.userConfig.update({
      where: {
        user_id: user,
      },
      data: config,
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
