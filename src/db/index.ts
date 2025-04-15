/**
 * @file Database client connecting to Drizzle and PostgreSQL.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** biome-ignore-all lint/style/noNamespaceImport: Drizzle is really stupid. */

import * as guildConfig from "@/db/schema/guildConfig.js";
import * as userConfig from "@/db/schema/userConfig.js";
import { env } from "@/utils/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Creates a new PostgreSQL client
const pg = postgres(env.POSTGRES_URL, {
  max: 1,

  // Sends annoying notices to the shadow realm
  onnotice: () => {
    return;
  },
});

// Creates a new Drizzle client
export const db = drizzle(pg, {
  schema: {
    ...guildConfig,
    ...userConfig,
  },
});
