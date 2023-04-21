/**
 * @file Hibiki
 * @description Creates a new Hibiki instance
 * @module hibiki
 */

import { HibikiClient } from "./classes/Client.js";
import { env } from "./utils/env.js";
import { logger } from "./utils/logger.js";
import * as Sentry from "@sentry/node";
import { getInfo } from "discord-hybrid-sharding";
import util from "node:util";

// Tries to initialize Sentry
if (env.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.npm_package_version,
    });

    logger.info(`Sentry connected to DSN ${env.SENTRY_DSN}`);
  } catch (error) {
    logger.error(`Failed to initialize sentry: ${util.inspect(error)}`);
  }
}
// Creates the initial instance of Hibiki
new HibikiClient(env.BOT_TOKEN, {
  defaultImageSize: 256,
  restMode: true,
  gateway: {
    firstShardID: getInfo().FIRST_SHARD_ID,
    lastShardID: getInfo().LAST_SHARD_ID,
    maxShards: getInfo().TOTAL_SHARDS,
    compress: true,
    intents: ["all"],
    disableEvents: {
      // Events to opt out of for some performance boosts
      TYPING_START: true,
    },
  },
});
