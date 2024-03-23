import { z } from "zod";

const envSchema = z.object({
  // A valid Discord token
  DISCORD_TOKEN: z.string().trim().min(1, { message: "Missing Discord token" }),

  // Testing Guild ID
  DISCORD_TEST_GUILD_ID: z.string().trim(),

  // Default locale, defaults to en-US
  DEFAULT_LOCALE: z.string().trim().default("en-US"),

  SENTRY_DSN: z.string(),

  // PostgreSQL options
  POSTGRES_USER: z.string().trim().min(1, { message: "Missing PostgreSQL user" }),
  POSTGRES_PASSWORD: z.string().trim().min(1, { message: "Missing PostgreSQL password" }),
  POSTGRES_PORT: z.string().trim().min(1, { message: "Missing PostgreSQL port" }),
  POSTGRES_HOST: z.string().trim().min(1, { message: "Missing PostgreSQL host" }),
  POSTGRES_DB: z.string().trim().min(1, { message: "Missing PostgreSQL DB" }),
  POSTGRES_URL: z.string().trim().min(1, { message: "Missing PostgreSQL URL" }),

  // Node/Bun stuff
  NODE_ENV: z.string().default("DEVELOPMENT"),
  npm_package_name: z.string().default("develop"),
  npm_package_version: z.string().default("develop"),
});

// Validates environment variables
const env = envSchema.parse(process.env);

export default env;
