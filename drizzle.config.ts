/**
 * @file Configuration file for Drizzle.
 * @license Zlib.
 */

/** biome-ignore-all lint/style/noDefaultExport: Drizzle config requires a default export. */

import { type Config, defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env";

// Configures drizzle
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
