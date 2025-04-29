/**
 * @file Fetches a network resource (wrapper around native fetch()).
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";

/**
 * Fetches a network resource (wrapper around native fetch()).
 * @param url Wrapper around native fetch() to perform a network request.
 * @param options Object containing request options.
 * @returns A fetched response.
 */

export async function hFetch(url: string, options?: RequestInit) {
  try {
    const response: Response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": "Hibiki (github.com/espimarisa/hibiki)",
      },
    });

    // Return undefined if response.ok is not set to enforce valid handling
    if (!response?.ok) {
      return;
    }

    return response;
  } catch (err) {
    const error = parseError(err);
    logger.warn(`Error fetching ${url}: ${error.message}`);
    captureError(error, {
      url: url,
      options: options,
    });

    throw error;
  }
}
