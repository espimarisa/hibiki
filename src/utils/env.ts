/**
 * @file Utility to parse and validate environment variables.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { DISCORD_TOKEN_REGEX } from "@/utils/constants.js";
import { env as processEnv } from "node:process";
import { z } from "zod";

// An object containing expected environment variables
const envSchema = z.object({
  /** Discord bot token to authenticate with. */
  DISCORD_TOKEN: z
    .string()
    .trim()
    .min(1, { message: "Missing DISCORD_TOKEN" })
    .regex(DISCORD_TOKEN_REGEX, "Malformed DISCORD_TOKEN"),

  /** Discord Guild ID to deploy development-mode commands and log bot events to. */
  DISCORD_DEV_GUILD_ID: z.string().trim().optional().default(""),

  /** Discord channel ID (inside of DISCORD_DEV_GUILD_ID) to send certain logs to. */
  DISCORD_DEV_CHANNEL_ID: z.string().trim().optional().default(""),

  /** Comma-space ('one, two') delimited list of bot statuses to cycle through. */
  DISCORD_STATUSES: z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((value) =>
      value ? value.split(",").map((item) => item.trim()) : [],
    ),

  /** Redis/Valkey database URL to connect to. */
  REDIS_URL: z.string().trim().url(),

  /** PostgreSQL database url to connect to. */
  POSTGRES_URL: z.string().trim().min(1, { message: "Missing POSTGRES_URL" }),

  /** Valid Sentry DSN URL (https) to submit and upload errors to. */
  SENTRY_DSN: z.string().trim().url().optional().default(""),

  /** IPInfo.io API key for the ipinfo command. */
  IPINFO_API_KEY: z.string().trim().optional().default(""),

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

/** Typing for valid environment variables. */
export type EnvironmentVariables = typeof env;

/**
 * Validates if environment variables existing and are > 1 character.
 * @param variable Environment variable object to check.
 * @param keys Array of environment variable keys to validate.
 * @returns A boolean indicating fail/success and a list of missing keys.
 */

export function validateKey(
  variable: EnvironmentVariables,
  keys: Array<keyof EnvironmentVariables>,
) {
  const missingKeys = keys.filter((key) => {
    const value = variable[key as keyof EnvironmentVariables];
    return typeof value !== "string" || value.length === 0;
  });

  // Return keys if validation failed
  if (missingKeys.length > 0) {
    return missingKeys;
  }

  return [];
}
