/**
 * @file Fetches a network resource (wrapper around native fetch()).
 * @license zlib
 */

import { fetchLog } from "@/utils/logger.js";
import { captureException } from "@sentry/bun";

/**
 * Fetches a network resource (wrapper around native fetch()).
 * @param input The resource to fetch.
 * @param init An object containing custom settings to apply to the request.
 * @returns A promise resolviing to a Response, undefined, or an error.
 */

export async function hFetch(
  input: string | URL | Request,
  init?: RequestInit,
) {
  // Prepare request options.
  const { headers: originalHeaders, ...headers } = init ?? {};

  // Create a new Headers object.
  const requestHeaders = new Headers(originalHeaders);
  requestHeaders.set("User-Agent", "Hibiki (github.com/espimarisa/hibiki)");
  const options = {
    ...headers,
    headers: requestHeaders,
  } satisfies RequestInit;

  try {
    // Fetches the network resource.
    const response = await fetch(input, options);
    fetchLog.debug(`${input}: ${response.status} ${response.statusText}.`);

    // Return undefined if response.ok is false.
    if (!response.ok) {
      return;
    }

    // Returns the response.
    return response;
  } catch (err) {
    fetchLog.warn(err, `Error fetching ${input}.`);
    captureException(err, { extra: { url: input, init: init } });
    return;
  }
}
