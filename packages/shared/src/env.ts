import * as dotenv from "dotenv";
import { cleanEnv, num, str } from "envalid";
import path from "node:path";

// Sets up our environment variables
dotenv.config({ path: path.resolve("../../.env") });

// Cleans our environment variables up
const sanitizedEnv = cleanEnv(process.env, {
  // Bot settings
  // TODO: Regexp test this
  BOT_TOKEN: str(),
  BOT_TEST_GUILD_ID: str(),

  // Database settings
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_HOST: str(),
  POSTGRES_PORT: num(),
  POSTGRES_DB: str(),
  POSTGRES_SCHEMA: str(),
  DATABASE_URL: str(),

  // Default Node.js env variables
  NODE_ENV: str({ default: "development" }),
  npm_package_name: str(),
  npm_package_version: str({ default: "development" }),
});

export default sanitizedEnv;
