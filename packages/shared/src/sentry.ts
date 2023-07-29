import { sanitizedEnv } from "./env.js";
import { logger } from "./logger.js";
import * as Sentry from "@sentry/node";
import util from "node:util";

export function initSentry(options?: Sentry.NodeOptions) {
  if (!sanitizedEnv.SENTRY_DSN) return;

  try {
    Sentry.init({
      dsn: sanitizedEnv.SENTRY_DSN,
      environment: sanitizedEnv.NODE_ENV,
      release: sanitizedEnv.npm_package_version,
      ...options,
    });

    logger.info(`Sentry connected to DSN ${sanitizedEnv.SENTRY_DSN}`);
  } catch (error) {
    logger.error(`Failed to initialize sentry: ${util.inspect(error)}`);
  }
}
