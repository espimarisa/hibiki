/**
 * @file Configuration file for Drizzle ORM.
 * @license zlib
 */

/** biome-ignore-all lint/style/noDefaultExport: Drizzle config requires a default export. */

import { env } from "@/utils/env.ts";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

// Configures drizzle.
export default defineConfig({
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema",
  strict: true,
  verbose: true,
}) satisfies Config;
