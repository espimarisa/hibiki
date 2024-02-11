import { DISCORD_BOT_TOKEN_REGEX } from "$utils/constants.ts";
import { z } from "zod";

const envSchema = z.object({
  BOT_TOKEN: z.string().regex(DISCORD_BOT_TOKEN_REGEX),
  BOT_TEST_GUILD_ID: z.string(),
  BOT_LOGGING_CHANNEL_ID: z.string(),
  BOT_CLIENT_ID: z.string(),

  // TODO: Validate this against locales/
  DEFAULT_LOCALE: z.string().default("en"),

  // Database stuff
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_SCHEMA: z.string(),
  DATABASE_URL: z.string(),

  // Node environment variable
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

export const env = envSchema.parse(Bun.env);

// Returns a list of env issues
export function getEnvIssues() {
  const result = envSchema.safeParse(Bun.env);
  if (!result.success) return result.error.issues;
  return;
}
