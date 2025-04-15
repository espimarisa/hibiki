/**
 * @file Drizzle ORM configuration file.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** biome-ignore-all lint/style/noDefaultExport: Drizzle prefers default exports */

import { env } from "node:process";
import { type Config, defineConfig } from "drizzle-kit";
import { z } from "zod";

// Validates schema
const envSchema = z.object({
  POSTGRES_URL: z.string().trim().min(1, { message: "Missing PostgreSQL URL" }),
});

const validatedEnv = envSchema.parse(env);

// Configures drizzle
export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema",
  dbCredentials: {
    url: validatedEnv.POSTGRES_URL,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
