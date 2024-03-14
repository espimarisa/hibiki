import db from "$db/client.ts";

export default async (user: string) => {
  try {
    const config = await db.query.userConfig.findFirst({
      where: (userConfig, { eq }) => eq(userConfig.user_id, user),
    });

    if (!config?.user_id) return;
    return config;
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
