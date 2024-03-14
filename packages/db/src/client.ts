import * as guildConfigs from "$db/schema/guild_config.ts";
import * as userConfigs from "$db/schema/user_config.ts";
import env from "$shared/env.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "node:path";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(new URL(import.meta.url)));
const DRIZZLE_DIRECTORY = path.join(pathDirname, "../drizzle");

const pg = postgres({
  max: 1,
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
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
    ...userConfigs,
    ...guildConfigs,
  },
});

// Runs migrations
await migrate(db, {
  migrationsFolder: DRIZZLE_DIRECTORY,
});

export default db;
