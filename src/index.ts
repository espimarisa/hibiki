/**
 * @file Index
 * @description Creates a new Hibiki instance
 * @module index
 */

import type { ClientOptions } from "@projectdysnomia/dysnomia";
import { HibikiClient } from "./classes/Client.js";
import { env } from "./utils/env.js";

// Client options
const options: ClientOptions = {
  defaultImageSize: 256,
  gateway: {
    compress: true,
    intents: ["all"],
  },
};

// Creates a new Hibiki instance
const bot = new HibikiClient(env.BOT_TOKEN, options);
bot.init();
