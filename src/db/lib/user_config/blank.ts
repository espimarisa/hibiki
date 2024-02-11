import prisma from "$db/index.js";

export default async (user: string) => {
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
    throw new Error(Bun.inspect(error));
  }
};
