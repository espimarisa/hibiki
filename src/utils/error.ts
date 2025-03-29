/**
 * @file Utilities for capturing and debugging errors.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/error
 */

import { env } from "@/utils/env.js";
import { loaderLogger } from "@/utils/logger.js";
import { init } from "@sentry/bun";

/**
 * Connects to a Sentry DSN.
 */

export function initSentry() {
	if (!env.SENTRY_DSN) {
		return;
	}

	try {
		init({
			dsn: env.SENTRY_DSN,
			environment: env.NODE_ENV,
			release: env.npm_package_version,
		});

		loaderLogger.info("Successfully connected to Sentry");
	} catch (error) {
		loaderLogger.error("Error while connecting to Sentry:");
		throw new Error(Bun.inspect(error));
	}
}
