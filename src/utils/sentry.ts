/**
 * @file sentry
 * @description Utilities for initializing Sentry.
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import { createLogger } from "@discordeno/utils";
import { type BunOptions, init } from "@sentry/bun";

const logger = createLogger({ name: "SENTRY" });

/**
 * Initializes a Sentry client.
 * @param options Sentry client options.
 */

export function sentryInit(options?: BunOptions) {
	if (!env.SENTRY_DSN) {
		logger.error("No Sentry DSN provided");
		return;
	}

	try {
		init({
			dsn: env.SENTRY_DSN,
			environment: env.NODE_ENV,
			release: env.npm_package_version,
			...options,
		});

		logger.info("Successfully initialized Sentry");
	} catch (error) {
		logger.error(`Error while initializing Sentry: ${Bun.inspect(error)}`);
	}
}
