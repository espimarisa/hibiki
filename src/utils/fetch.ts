/**
 * @file Utilities for fetching from API endpoints.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/fetch
 */

import { env } from "@/utils/env.js";
import { getError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { Client } from "discord.js";

/**
 * Wrapper around native fetch() to append application headers to all requests.
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
    const error = getError(err);
    logger.warn(`Error fetching ${url}: ${error.message}`);
    throw new Error(error.stack);
  }
}

/**
 * Fetches a client emoji.
 * @param client The client to fetch the emoji with.
 * @param emoji The ID of the emoji to fetch.
 * @param fallback The fallback emoji to use.
 */

export async function fetchClientEmoji(
  client: Client,
  emoji: string,
  fallback: string,
) {
  try {
    const fetched = await client.application?.emojis.fetch(emoji);
    if (fetched?.id) {
      return fetched.toString();
    }
  } catch (err) {
    logger.warn(`Failed to fetch client emoji: ${emoji}, using fallback`);
  }

  return fallback;
}
