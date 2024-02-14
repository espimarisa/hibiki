import prisma from "$db/index.ts";

export default async (user: string) => {
  try {
    await prisma.userConfig.delete({
      where: {
        user_id: user,
      },
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
