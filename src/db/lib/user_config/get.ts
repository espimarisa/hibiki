import prisma from "$db/index.js";

export default async (user: string) => {
  try {
    const config: HibikiUserConfig | null = await prisma.userConfig.findUnique({
      where: {
        user_id: user,
      },
    });

    if (!config?.user_id) return;
    return config;
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
