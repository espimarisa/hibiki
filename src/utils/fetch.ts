/**
 * @file Fetches a network resource (wrapper around native fetch()).
 * @license zlbi
 */

import { fetchLog } from "@/utils/logger.js";
import { captureException } from "@sentry/bun";

/**
 * Fetches a network resource (wrapper around native fetch()).
 * @param input Wrapper around native fetch() to perform a network request.
 * @param initOptions Object containing request options.
 * @returns A promise resolving to a fetched response, or undefined.
 */

export async function hFetch(input: string, initOptions?: RequestInit) {
  try {
    const response: Response = await fetch(input, {
      ...initOptions,
      headers: {
        ...initOptions?.headers,
        "User-Agent": "Hibiki (github.com/espimarisa/hibiki)",
      },
    });

    fetchLog.debug(
      `URL ${input} returned status ${response.status} ${response.statusText}.`,
    );

    // Return undefined if response.ok is not ok to enforce valid parsing.
    if (!response?.ok) {
      fetchLog.debug(`Response for URL ${input} is not OK.`);
      return;
    }

    return response;
  } catch (err) {
    fetchLog.warn(err, `Error fetching ${input}.`);
    captureException(err, { extra: { url: input, options: initOptions } });
    return;
  }
}
