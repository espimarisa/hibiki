import path from "node:path";
import { env } from "$shared/env.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// biome-ignore lint/style/noNamespaceImport: Drizzle requies a namespace export
import * as guildConfig from "$db/schema/guild_config.ts";
// biome-ignore lint/style/noNamespaceImport: Drizzle requies a namespace export
import * as userConfig from "$db/schema/user_config.ts";

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
