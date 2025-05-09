/**
 * @file Fetches a network resource (wrapper around native fetch()).
 * @license Zlib
 */

import { captureError, parseError } from "@/utils/error.ts";
import { fetchLog } from "@/utils/logger.ts";

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

    fetchLog.debug(
      `URL ${url} returned status ${response.status} ${response.statusText}.`,
    );

    // Return undefined if response.ok is not ok to enforce valid parsing.
    if (!response?.ok) {
      fetchLog.debug(`Response for URL ${url} is not OK.`);
      return;
    }

    return response;
  } catch (err) {
    const error = parseError(err);
    fetchLog.warn(`Error fetching ${url}: ${error.message}`);
    captureError(error, { url: url, options: options });
    throw error;
  }
}
