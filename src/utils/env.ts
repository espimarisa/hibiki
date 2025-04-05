/**
 * @file Utility to parse and validate environment variables.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/env
 */

import { env as processEnv } from "node:process";
import { z } from "zod";

const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;
const DISCORD_SNOWFLAKE_REGEX = /^(?<id>\d{17,20})$/;

// An object containing expected environment variables
const envSchema = z.object({
  // Bot token to log into the Discord API with
  DISCORD_TOKEN: z
    .string()
    .trim()
    .min(1, { message: "Missing DISCORD_TOKEN" })
    .regex(DISCORD_TOKEN_REGEX, "Malformed DISCORD_TOKEN"),

  // Discord Guild ID to use for development mode/event logging
  DISCORD_DEV_GUILD_ID: z
    .string()
    .trim()
    .regex(DISCORD_SNOWFLAKE_REGEX)
    .optional()
    .default(""),

  // A comma-space delimited list of Discord statuses to set
  DISCORD_STATUSES: z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((value) =>
      value ? value.split(",").map((item) => item.trim()) : [],
    ),

  // A Sentry DSN URL (https) to submit and upload errors to
  SENTRY_DSN: z.string().trim().url().optional().default(""),

  // A fine-grained GitHub personal access token
  GITHUB_PAT: z.string().trim().optional().default(""),

  // A discord emoji ID pointing to a :blobcatcookie:
  EMOJI_BLOBCAT_COOKIE: z.string().trim().optional().default(""),

  // Bun variables to ensure always exist
  NODE_ENV: z.string().default("development"),
  npm_package_name: z.string().default("develop"),
  npm_package_version: z.string().default("develop"),
});

// Parses and validates environment variables
const result = envSchema.safeParse(processEnv);

if (!result.success) {
  throw new Error(
    `Failed validating variables:\n${result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n")}`,
  );
}

/** Validated environment variables. */
export const env: z.infer<typeof envSchema> = result.data;
