import * as dotenv from "dotenv";
import { cleanEnv, num, str } from "envalid";
import path from "node:path";

// Sets up our environment variables
dotenv.config({ path: path.resolve("../../.env") });

// Cleans our environment variables up
export const sanitizedEnv = cleanEnv(process.env, {
  // Bot settings
  BOT_TOKEN: str(),
  BOT_TEST_GUILD_ID: str({ default: undefined }),
  BOT_LOGGING_CHANNEL_ID: str({ default: undefined }),

  // oAuth2 settings
  BOT_CLIENT_ID: str(),
  BOT_OAUTH_CLIENT_SECRET: str(),
  BOT_OAUTH_REDIRECT_URI: str(),

  // Global settings
  DEFAULT_LOCALE: str({ default: "en" }),
  SENTRY_DSN: str({ default: undefined }),

  // Web settings
  WEB_BASE_URL: str(),
  AUTH_SECRET: str(),

  // Database settings
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_HOST: str(),
  POSTGRES_PORT: num(),
  POSTGRES_DB: str(),
  POSTGRES_SCHEMA: str(),
  DATABASE_URL: str(),

  // Default Node.js env variables
  NODE_ENV: str(),
  npm_package_name: str(),
  npm_package_version: str(),
});
