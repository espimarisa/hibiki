/**
 * @file Utility for parsing and validation of environment variables.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { DISCORD_TOKEN_REGEX } from "@/utils/constants.js";
import { env as processEnv } from "node:process";
import { z } from "zod";

// Helper to validate optional strings
const optionalString = () => z.string().trim().optional().default("");

// Helper to validate URLs requiring a prefix (i.e name://)
const prefixedUrl = (prefix: string, message: string) =>
  z
    .string()
    .trim()
    .url()
    .refine((url) => url.startsWith(prefix), { message });

// Helper to validate required strings
const requiredString = (message: string) =>
  z.string().trim().min(1, { message });

// Environment variables to validate
const envSchema = z.object({
  /**
   * REQUIRED: Discord bot token to authenticate with.
   * @see https://discord.com/developers/docs/quick-start/getting-started
   */

  DISCORD_TOKEN: requiredString("Missing DISCORD_TOKEN").regex(
    DISCORD_TOKEN_REGEX,
    "Malformed DISCORD_TOKEN",
  ),

  /**
   * OPTIONAL: Discord guild ID to deploy development-mode commands and log certain events to.
   * @see https://discord.com/developers/docs/resources/guild
   */

  DISCORD_DEV_GUILD_ID: optionalString(),

  /**
   * OPTIONAL: Discord channel ID (inside of DISCORD_DEV_GUILD_ID) to log certain events to.
   * @see https://discord.com/developers/docs/resources/guild
   */

  DISCORD_DEV_CHANNEL_ID: optionalString(),

  /**
   * OPTIONAL: Comma-space delimited ('one, two') list of bot statuses to cycle through.
   * @see https://en.wikipedia.org/wiki/Comma-separated_values
   */

  DISCORD_STATUSES: optionalString().transform((value) =>
    value ? value.split(",").map((item) => item.trim()) : [],
  ),

  /**
   * REQUIRED: Redis server URL to connect to.
   * @see https://redis.io/docs/latest/develop/clients/nodejs/connect/
   * @default redis://127.0.0.1:6379
   */

  REDIS_URL: prefixedUrl("redis://", "REDIS_URL must start with redis://"),

  /**
   * REQUIRED: PostgreSQL database connection URL to connect to.
   * @see https://www.postgresql.org/docs/6.4/jdbc19100.htm
   * @default postgresql://postgres:postgres@127.0.0.1:5432/hibiki
   */

  POSTGRES_URL: prefixedUrl(
    "postgresql://",
    "POSTGRES_URL must start with postgres://",
  ),

  /**
   * OPTIONAL: Sentry.io DSN URL to submit and log errors to.
   * @see https://docs.sentry.io/concepts/key-terms/dsn-explainer/#where-to-find-your-data-source-name-dsn
   */

  SENTRY_DSN: z.string().trim().url().optional().default(""),

  /**
   * OPTIONAL: IPinfo.io API key used to get IP address information.
   * @see https://ipinfo.io/signup
   */

  IPINFO_API_KEY: z.string().trim().optional().default(""),

  /**
   * OPTIONAL: AbuseIPDB API key used to get IP address abuse information.
   * @see https://www.abuseipdb.com/api.html
   */

  ABUSEIPDB_API_KEY: z.string().trim().optional().default(""),

  /**
   * AUTOMATIC: The current NODE_ENV environment.
   * @see https://bun.sh/guides/runtime/set-env
   * @default development
   */

  NODE_ENV: z.string().default("development"),

  /**
   * AUTOMATIC: The package name inside of package.json.
   * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json
   * @default @espimarisa/hibiki
   */

  npm_package_name: z.string().default("@espimarisa/hibiki"),

  /**
   * AUTOMATIC: The package version inside of package.json.
   * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json
   * @default develop
   */

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

/** An object of validated environment variables. */
export const env: z.infer<typeof envSchema> = result.data;

/** Typing for validated environment variables. */
export type EnvironmentVariables = typeof env;

/**
 * Validates if environment variables exist and are >1 character.
 * @param variable Environment variable object to check.
 * @param keys Array of environment variable keys to validate.
 * @returns A list of missing or invalid environment variables.
 */

export function validateKey(
  variable: EnvironmentVariables,
  keys: (keyof EnvironmentVariables)[],
) {
  const missingKeys = keys.filter((key) => {
    const value = variable[key];
    return typeof value !== "string" || value.length === 0;
  });

  return missingKeys;
}
