/**
 * @file Fetch
 * @description A custom wrapper around native fetch for Hibiki
 * @module utils/fetch
 */

import { hibikiVersion } from "./constants.js";

/**
 * Wraps around fetch() and adds our User-Agent, etc
 * @param url The URL to fetch
 * @param options Any additional options to add
 */

export default async (url: string, options?: RequestInit): Promise<Response | undefined> => {
  if (!url) return;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": `hibiki/${hibikiVersion} (https://github.com/sysdotini/hibiki)`,
      },
    });

    // Return the response to JSOn
    if (!response) return;
    return response;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
