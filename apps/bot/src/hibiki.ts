import { HibikiClient } from "./classes/Client.js";
import { sanitizedEnv } from "./utils/env.js";
import { logger } from "./utils/logger.js";
import * as Sentry from "@sentry/node";
import util from "node:util";

// Tries to initialize Sentry
if (sanitizedEnv.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: sanitizedEnv.SENTRY_DSN,
      environment: sanitizedEnv.NODE_ENV,
      release: sanitizedEnv.npm_package_version,
    });

    logger.info(`Sentry connected to DSN ${sanitizedEnv.SENTRY_DSN}`);
  } catch (error) {
    logger.error(`Failed to initialize sentry: ${util.inspect(error)}`);
  }
}

new HibikiClient({ intents: ["GuildMembers"] }).init();
