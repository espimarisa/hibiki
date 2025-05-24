/**
 * @file Parses and validates environment variables.
 * @license zlib
 */

import { env as processEnv } from "node:process";
import { z } from "zod/v4";

// Regex used to validate Discord tokens with.
const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// Schema for valid Hibiki environment variables.
const schema = z.object({
  /**
   * Discord bot token to authenticate with.
   * @see https://discord.com/developers/docs/quick-start/getting-started
   */

  BOT_TOKEN: z.string().regex(DISCORD_TOKEN_REGEX),

  /**
   * Comma-space delimited list (or a single) statuses to cycle through.
   * @example BOT_STATUSES="status 1, status 2, status 3" or BOT_STATUSES="single status"
   * @see https://en.wikipedia.org/wiki/Comma-separated_values
   */

  BOT_STATUSES: z
    .string()
    .optional()
    .transform((value) => {
      return value ? value.split(",").map((item) => item.trim()) : [];
    }),

  /**
   * Discord channel ID to log certain events to.
   * @see https://discord.com/developers/docs/resources/guild
   */

  DEV_CHANNEL_ID: z.string().optional(),

  /**
   * Discord guild ID to log certain events to.
   * @see https://discord.com/developers/docs/resources/guild
   */

  DEV_GUILD_ID: z.string().optional(),

  /**
   * Sentry.io DSN URL to upload errors to.
   * @see https://docs.sentry.io/concepts/key-terms/dsn-explainer/#where-to-find-your-data-source-name-dsn
   */

  SENTRY_DSN: z.url().optional(),

  /**
   * AbuseIPDB API key used for certain commands.
   * @see https://www.abuseipdb.com/api.html
   */

  API_KEY_ABUSEIPDB: z.string().optional(),

  /**
   * IPInfo.IO API key used for certain commands.
   * @see https://ipinfo.io/signup
   */

  API_KEY_IPINFO: z.string().optional(),

  /**
   * PostgreSQL database to connect to.
   * @default postgres
   */

  POSTGRES_DB: z.string().optional().default("postgres"),

  /**
   * PostgreSQL host to connect to.
   * @default 127.0.0.1
   */

  POSTGRES_HOST: z.string().optional().default("127.0.0.1"),

  /**
   * PostgreSQL password to authenticate with.
   * @default postgres
   */

  POSTGRES_PASSWORD: z.string().optional().default("postgres"),

  /**
   * PostgreSQL port to connect to (the host port).
   * @default 5432
   */

  POSTGRES_PORT: z.coerce.number().optional().default(5432),

  /**
   * PostgreSQL username to authenticate with.
   * @default postgres
   */

  POSTGRES_USER: z.string().optional().default("postgres"),

  /**
   * Valkey password to authenticate with.
   * @default ""
   */

  VALKEY_PASSWORD: z.string().optional(),

  /**
   * Valkey port to connect to (the host port).
   * @default 6379
   */

  VALKEY_PORT: z.coerce.number().optional().default(6379),

  /**
   * Valkey URL to connect to.
   * @default valkey://127.0.0.1:6379
   */

  VALKEY_URL: z.string().optional().default("valkey://127.0.0.1:6379"),

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

// Parses and validates the schema.
const parsed = schema.safeParse(processEnv);
if (!parsed.success) {
  throw new Error(
    `Failed validating environment variables:\n${parsed.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n")}`,
  );
}

// An object of parsed environment variables.
export const env: z.infer<typeof schema> = parsed.data;
