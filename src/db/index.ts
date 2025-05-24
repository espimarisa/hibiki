/**
 * @file Primary PostgreSQL/Drizzle database client.
 * @license zlib
 */

/** biome-ignore-all lint/performance/noNamespaceImport: Drizzle requires a namespace import. */

import * as guild_config_schema from "@/db/schema/guild_config.js";
import * as starboard_schema from "@/db/schema/starboard.js";
import * as user_config_schema from "@/db/schema/user_config.js";
import { env } from "@/utils/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

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
