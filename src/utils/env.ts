/**
 * @file env
 * @description Sanitizes and sets up our environment variables
 * @module utils/env
 */

import * as dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

// Sets up our environment variables
dotenv.config();

// Cleans our environment variables up
export const env = cleanEnv(process.env, {
  // This should always match anything we append to .env
  // TODO: Properly type
  DATABASE_URL: str({ default: "" }),
  BOT_TOKEN: str({ default: undefined }),
  TEST_GUILD_ID: str({ default: undefined }),
  DEFAULT_LOCALE: str({ default: "en-GB" }),
});
