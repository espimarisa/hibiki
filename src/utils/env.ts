/**
 * @file Parses and validates environment variables.
 * @license zlib
 */

import { env as processEnv } from "node:process";
import { z } from "zod";

// A regex to validate Discord tokens.
const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

/**
 * Zod helper function to validate an optional string environment variable.
 * @returns A validated optional string environment variable.
 */

function validateOptionalString() {
  return z.string().trim().optional().default("");
}

/**
 * Zod helper function to validate a prefixed string environment variable.
 * @param prefix The prefix to validate (i.e postgresql://).
 * @param message A message to log if validation fails.
 * @returns A validated prefixed string environment variable.
 */

function validatePrefixedString(prefix: string, message: string) {
  return z
    .string()
    .trim()
    .url()
    .refine((url) => url.startsWith(prefix), { message: message });
}

/**
 * Zod helper function to validate a required string environment variable.
 * @param message A message to log if validation fails.
 * @returns A validated string environment variable.
 */

function validateRequiredString(message: string) {
  return z.string().trim().min(1, { message: message });
}

// Schema for environment variable validation.
const envSchema = z.object({
  /**
   * Discord bot token to authenticate with.
   * @see https://discord.com/developers/docs/quick-start/getting-started
   */

  DISCORD_TOKEN: validateRequiredString("Missing DISCORD_TOKEN").regex(
    DISCORD_TOKEN_REGEX,
    "Malformed DISCORD_TOKEN",
  ),

  /**
   * Discord guild ID to deploy development-mode commands and log certain events to.
   * @see https://discord.com/developers/docs/resources/guild
   */

  DISCORD_DEV_GUILD_ID: validateOptionalString(),

  /**
   * Discord channel ID (inside of DISCORD_DEV_GUILD_ID) to log certain events to.
   * @see https://discord.com/developers/docs/resources/guild
   */

  DISCORD_DEV_CHANNEL_ID: validateOptionalString(),

  /**
   * Comma-space delimited ('one, two') list of bot statuses to cycle through.
   * @see https://en.wikipedia.org/wiki/Comma-separated_values
   */

  DISCORD_STATUSES: validateOptionalString().transform((value) =>
    value ? value.split(",").map((item) => item.trim()) : [],
  ),

  /**
   * Redis server URL to connect to.
   * @see https://redis.io/docs/latest/develop/clients/nodejs/connect/
   * @default redis://127.0.0.1:6379
   */

  REDIS_URL: validatePrefixedString(
    "redis://",
    "REDIS_URL must start with redis://",
  ),

  /**
   * PostgreSQL database connection URL to connect to.
   * @see https://www.postgresql.org/docs/6.4/jdbc19100.htm
   * @default postgresql://postgres:postgres@127.0.0.1:5432/hibiki
   */

  POSTGRES_URL: validatePrefixedString(
    "postgresql://",
    "POSTGRES_URL must start with postgres://",
  ),

  /**
   * Sentry.io DSN URL to submit and log errors to.
   * @see https://docs.sentry.io/concepts/key-terms/dsn-explainer/#where-to-find-your-data-source-name-dsn
   */

  SENTRY_DSN: z.string().trim().url().optional().default(""),

  /**
   * IPinfo.io API key used to get IP address information.
   * @see https://ipinfo.io/signup
   */

  IPINFO_API_KEY: z.string().trim().optional().default(""),

  /**
   * AbuseIPDB API key used to get IP address abuse information.
   * @see https://www.abuseipdb.com/api.html
   */

  ABUSEIPDB_API_KEY: z.string().trim().optional().default(""),

  /**
   * The current NODE_ENV environment.
   * @see https://bun.sh/guides/runtime/set-env
   * @default DEVELOPMENT
   */

  NODE_ENV: z.string().default("DEVELOPMENT"),

  /**
   * The package name inside of package.json.
   * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json
   * @default @espimarisa/hibiki
   */

  npm_package_name: z.string().default("@espimarisa/hibiki"),

  /**
   * The package version inside of package.json.
   * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json
   * @default develop
   */

  npm_package_version: z.string().default("develop"),
});

// Parses and validates the env schema.
const validatedSchema = envSchema.safeParse(processEnv);
if (!validatedSchema.success) {
  throw new Error(
    `Failed validating variables:\n${validatedSchema.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n")}`,
  );
}

/** A Zod object containing parsed environment variables. */
export const env: z.infer<typeof envSchema> = validatedSchema.data;
