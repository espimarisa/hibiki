/**
 * @file Fetch
 * @description A custom wrapper around native fetch for Hibiki
 * @module fetch
 */

import { hibikiVersion } from "./constants.js";

/**
 * Wraps around fetch() and adds our User-Agent, etc
 * @param url The URL to fetch
 * @param options Any additional options to add
 */

export default async (url: string, options?: RequestInit): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": `hibiki/${hibikiVersion} (https://github.com/sysdotini/hibiki)`,
      },
    });

    // Return undefined if no response
    if (!response) return;

    // Else, return a JSON response
    if (response) return response.json();
  } catch (error) {
    throw new Error(`${error}`);
  }
};
