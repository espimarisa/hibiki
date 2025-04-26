/**
 * @file Database client for interacting with Drizzle/PostgreSQL.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** biome-ignore-all lint/style/noNamespaceImport: Drizzle requires a namespace import. */

import * as guildConfig from "@db/schema/guildConfig.js";
import * as userConfig from "@db/schema/userConfig.js";
import { env } from "@utils/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Creates a PostgreSQL client
const pg = postgres(env.POSTGRES_URL, {
  // Sends annoying notices to the shadow realm
  onnotice: () => {
    return;
  },
});

/** Drizzle's PostgreSQL database client. */
export const db = drizzle(pg, {
  schema: {
    ...guildConfig,
    ...userConfig,
  },
});
