import * as dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

// Sets up our environment variables
dotenv.config();

// Cleans our environment variables up
export const sanitizedEnv = cleanEnv(process.env, {
  // Hibiki config items
  TOKEN: str({ default: undefined }),
  DEFAULT_LOCALE: str({ default: "en" }),
  TEST_GUILD_ID: str({ default: undefined }),
  SENTRY_DSN: str({ default: undefined }),

  // Web stuff
  AUTH_SECRET: str({ default: undefined }),
  DISCORD_CLIENT_ID: str({ default: undefined }),
  DISCORD_CLIENT_SECRET: str({ default: undefined }),
  DISCORD_REDIRECT_URL: str({ default: "http://localhost:5173/auth/callback/discord" }),

  // Prisma config items
  DATABASE_URL: str({ default: undefined }),

  // Default Node.js env variables
  NODE_ENV: str({ default: undefined }),
  npm_package_version: str({ default: "develop" }),
});
