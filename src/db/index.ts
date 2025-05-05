/**
 * @file Database client for interacting with Drizzle/PostgreSQL.
 * @license Zlib
 */

/** biome-ignore-all lint/style/noNamespaceImport: Drizzle requires a namespace import. */

import * as guild_config_schema from "@/db/schema/guild_config.ts";
import * as starboard_schema from "@/db/schema/starboard.ts";
import * as user_config_schema from "@/db/schema/user_config.ts";
import { env } from "@/utils/env.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Define the regex pattern as a JavaScript string literal

// Creates a PostgreSQL client.
const pg = postgres(env.POSTGRES_URL);

// Creates a primary Drizzle database client.
export const db = drizzle(pg, {
  schema: {
    ...guild_config_schema,
    ...starboard_schema,
    ...user_config_schema,
  },
});
