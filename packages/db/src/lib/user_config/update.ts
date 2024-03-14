import db from "$db/client.ts";
import { getUserConfig } from "$db/index.ts";
import { userConfig } from "$db/schema/user_config.ts";
import { eq } from "drizzle-orm";

export default async (user: string, config: HibikiUserConfig) => {
  try {
    // Checks for an existing config
    const existingConfig = await getUserConfig(user);

    // Update if exists, else insert
    await (existingConfig?.user_id
      ? db.update(userConfig).set(config).where(eq(userConfig.user_id, user))
      : db.insert(userConfig).values(config).onConflictDoNothing());
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
};
