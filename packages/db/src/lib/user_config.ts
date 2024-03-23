import { eq } from "drizzle-orm";

import db from "$db/index.ts";
import { userConfig } from "$db/schema/user_config.ts";

import type { HibikiUserConfig } from "../typings/index";

// Gets a user config
export async function getUserConfig(user: string) {
  try {
    const config = await db.query.userConfig.findFirst({
      where: (userConfig, { eq }) => eq(userConfig.user_id, user),
    });

    if (!config?.user_id) return;
    return config;
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}

// Deletes a user config
export async function deleteUserConfig(user: string) {
  try {
    await db.transaction(async (query) => {
      await query.delete(userConfig).where(eq(userConfig.user_id, user));
    });
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}

// Updates or inserts a user config
export async function updateUserConfig(user: string, config: HibikiUserConfig) {
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
}

// Creates a blank user config
export async function createBlankUserConfig(user: string) {
  try {
    await db.insert(userConfig).values({ user_id: user }).onConflictDoNothing();
  } catch (error) {
    throw new Error(Bun.inspect(error));
  }
}
