/**
 * @file Primary PostgreSQL/Drizzle database client.
 * @license zlib
 */

/** biome-ignore-all lint/performance/noNamespaceImport: Drizzle requires a namespace import. */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as guild_config_schema from "@/db/schema/guild_config.ts";
import * as starboard_schema from "@/db/schema/starboard.ts";
import * as user_config_schema from "@/db/schema/user_config.ts";
import { env } from "@/utils/env.ts";

// Creates a PostgreSQL client.
const pg = postgres({
  database: env.POSTGRES_DB,
  host: env.POSTGRES_HOST,
  password: env.POSTGRES_PASSWORD,
  port: env.POSTGRES_PORT,
  user: env.POSTGRES_USER,
});

// Creates a Drizzle database client.
const db = drizzle(pg, {
  schema: {
    ...guild_config_schema,
    ...starboard_schema,
    ...user_config_schema,
  },
});

// Exports the DB client.
export { db };
