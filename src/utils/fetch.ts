/**
 * @file Utility to wrap around native fetch() and dynamically append headers.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@/utils/env.js";
import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";

/**
 * Wrapper around native fetch().
 * @param url The URL to fetch.
 * @param options Fetch options.
 * @returns A fetch response.
 */

export async function hFetch(url: string, options?: RequestInit) {
  try {
    const response: Response | undefined = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": `${env.npm_package_name}/${env.npm_package_version} (github.com/espimarisa/hibiki)`,
      },
    });

    if (!response) {
      return;
    }

    return response;
  } catch (err) {
    const error = parseError(err);
    logger.warn(`Error fetching ${url}: ${error.message}`);

    // Captures the error with Sentry
    captureError(error, {
      url: url,
      options: options,
    });
  }

  return;
}
