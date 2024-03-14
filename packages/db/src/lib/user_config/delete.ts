import db from "$db/client.ts";
import { userConfig } from "$db/schema/user_config.ts";
import { eq } from "drizzle-orm";

export default async (user: string) => {
  try {
    await db.transaction(async (query) => {
      await query.delete(userConfig).where(eq(userConfig.user_id, user));
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
