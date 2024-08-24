import { z } from "zod";

// Array of all possible API keys
export type API_KEYS = "API_GITHUB_PAT" | "API_TEST";

const envSchema = z.object({
  // A valid Discord token
  DISCORD_TOKEN: z.string().trim().min(1, { message: "Missing Discord token" }),

  // Testing Guild ID
  DISCORD_TEST_GUILD_ID: z.string().trim(),

  // Default locale, defaults to en-US
  DEFAULT_LOCALE: z.string().trim().default("en-US"),

  // Discord statuses to cycle through
  DISCORD_STATUSES: z.string().trim(),

  // Sentry/Glitchtip DSN for error reporting
  SENTRY_DSN: z.string().optional(),

  // API keys
  API_GITHUB_PAT: z.string().trim().optional(),

  // Node/Bun stuff
  NODE_ENV: z.string().default("DEVELOPMENT"),
  npm_package_name: z.string().default("develop"),
  npm_package_version: z.string().default("develop"),
});

// Validates environment variables
export const env = envSchema.parse(process.env);
