import { env } from "$shared/env.ts";
import { logger } from "$shared/logger.ts";
import * as sentry from "@sentry/bun";

export function initSentry(options?: sentry.BunOptions) {
  if (!env.SENTRY_DSN) {
    return;
  }

  try {
    sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      release: env.npm_package_version,
      tracesSampleRate: 0.2,
      ...options,
    });

    logger.info(`Sentry client connected to DSN ${env.SENTRY_DSN}`);
  } catch (error) {
    logger.error(`Failed to initialize Sentry: ${Bun.inspect(error)}`);
  }
}
