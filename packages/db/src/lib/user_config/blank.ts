import db from "$db/client.ts";
import { userConfig } from "$db/schema/user_config.ts";

export default async (user: string) => {
  try {
    await db.insert(userConfig).values({ user_id: user }).onConflictDoNothing();
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
