import Package from "../../package.json";
import fetch from "cross-fetch";

// Transverse the fetch function and add our user-agent string.
export default (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "User-Agent": `hibiki/${Package.version} (https://github.com/sysdotini/hibiki)`,
    },
  });
};
