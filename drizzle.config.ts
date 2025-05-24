/**
 * @file Configuration file for Drizzle ORM.
 * @license zlib
 */

/** biome-ignore-all lint/style/noDefaultExport: Drizzle config requires a default export. */

import { env } from "@/utils/env";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

// Configures drizzle.
export default defineConfig({
  dbCredentials: {
    database: env.POSTGRES_DB,
    host: env.POSTGRES_HOST,
    password: env.POSTGRES_PASSWORD,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema",
  strict: true,
  verbose: true,
}) satisfies Config;
