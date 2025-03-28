/**
 * @file Utilities for registering and interacting with Sentry.
 * @todo Stop
 * @author Espi Marisa <contact@espi.me>
 * @module utils/sentry
 */

import { env } from "@/utils/env.ts";
import { type BunOptions, init } from "@sentry/bun";

/**
 * Initializes a Sentry client.
 * @param options Sentry client options.
 */

export function sentryInit(options?: BunOptions) {
	if (!env.SENTRY_DSN) {
		// console.error("No Sentry DSN provided");
		return;
	}

	try {
		init({
			dsn: env.SENTRY_DSN,
			environment: env.NODE_ENV,
			release: env.npm_package_version,
			...options,
		});

		// console.info("Successfully initialized Sentry");
	} catch (error) {
		// console.error(`Error while initializing Sentry: ${Bun.inspect(error)}`);
	}
}
