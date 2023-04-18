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
  BOT_TOKEN: str({ default: undefined }),
});
