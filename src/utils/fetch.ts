/**
 * @file Fetch
 * @description Custom wrapper around fetch for Hibiki
 * @module utilities/fetch
 */

const { version } = require("../../package.json");

/**
 * Wraps around fetch() and adds our User-Agent, etc
 * @param url The URL to fetch
 * @param options Any additional options to add
 */

export default (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "User-Agent": `hibiki/${version} (https://github.com/sysdotini/hibiki)`,
    },
  });
};
