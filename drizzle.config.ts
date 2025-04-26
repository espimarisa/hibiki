/**
 * @file Configuration file for Drizzle.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** biome-ignore-all lint/style/noDefaultExport: Drizzle config requires a default export. */

import { env } from "node:process";
import { type Config, defineConfig } from "drizzle-kit";
import { z } from "zod";

// Validates POSTGRES_URL
const envSchema = z
  .object({
    POSTGRES_URL: z
      .string()
      .trim()
      .min(1, { message: "Missing PostgreSQL URL" }),
  })
  .parse(env);

// Configures drizzle
export default defineConfig({
  dbCredentials: {
    url: envSchema.POSTGRES_URL,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema",
  strict: true,
  verbose: true,
}) satisfies Config;
