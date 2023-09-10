import * as dotenv from "dotenv";
import { cleanEnv, str } from "envalid";
import path from "node:path";

// Sets up our environment variables
dotenv.config({ path: path.resolve("../../.env") });

// Cleans our environment variables up
export const sanitizedEnv = cleanEnv(process.env, {
  BOT_TOKEN: str(),
  BOT_CLIENT_ID: str(),
  BOT_TEST_GUILD_ID: str({ default: undefined }),
  BOT_LOGGING_CHANNEL_ID: str({ default: undefined }),

  BOT_OAUTH_CLIENT_SECRET: str({ default: undefined }),
  BOT_OAUTH_REDIRECT_URI: str({ default: undefined }),

  DEFAULT_LOCALE: str(),
  SENTRY_DSN: str({ default: undefined }),

  AUTH_SECRET: str(),
  WEB_BASE_URL: str(),

  // Database URL
  DATABASE_URL: str(),

  // Default Node.js env variables
  NODE_ENV: str({ default: "develop" }),
  npm_package_name: str({ default: undefined }),
  npm_package_version: str({ default: "develop" }),
});
