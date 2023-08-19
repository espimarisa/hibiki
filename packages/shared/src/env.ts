import * as dotenv from "dotenv";
import { cleanEnv, str } from "envalid";
import path from "node:path";

// Sets up our environment variables
dotenv.config({ path: path.resolve("../../.env") });

// Cleans our environment variables up
export const sanitizedEnv = cleanEnv(process.env, {
  BOT_TOKEN: str(),
  BOT_CLIENT_ID: str(),
  BOT_TEST_GUILD_ID: str(),

  BOT_OAUTH_CLIENT_SECRET: str({ default: undefined }),
  BOT_OAUTH_REDIRECT_URI: str({ default: undefined }),

  WEB_COOKIE_SECRET: str(),
  WEB_PRODUCTION_URL: str({ default: undefined }),

  DATABASE_URL: str(),
  DEFAULT_LOCALE: str(),
  SENTRY_DSN: str({ default: undefined }),

  // Default Node.js env variables
  NODE_ENV: str(),
  npm_package_name: str(),
  npm_package_version: str(),
});
