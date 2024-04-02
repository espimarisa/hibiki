import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import * as guildConfig from "$db/schema/guild_config.ts";
import * as userConfig from "$db/schema/user_config.ts";
import { env } from "$shared/env.ts";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));
const DRIZZLE_DIRECTORY = path.join(pathDirname, "../drizzle");

const pg = postgres({
  max: 1,
  host: env.POSTGRES_HOST,
  port: Number.parseInt(env.POSTGRES_PORT),
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,

  // Sends annoying notices to the shadow realm
  onnotice: () => {
    return;
  },
});

const db = drizzle(pg, {
  schema: {
    ...userConfig,
    ...guildConfig,
  },
});

// Runs migrations
await migrate(db, {
  migrationsFolder: DRIZZLE_DIRECTORY,
});

export { db };

// Exports lib for ease of use
export { createBlankGuildConfig, deleteGuildConfig, getGuildConfig, updateGuildConfig } from "$db/lib/guild_config.ts";
export { createBlankUserConfig, deleteUserConfig, getUserConfig, updateUserConfig } from "$db/lib/user_config.ts";
