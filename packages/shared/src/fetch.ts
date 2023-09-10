import { sanitizedEnv } from "./env.js";

export default async (url: string, options?: RequestInit) => {
  if (!url) return;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": `${sanitizedEnv.npm_package_name}/${sanitizedEnv.npm_package_version} (github.com/espimarisa/hibiki)`,
      },
    });

    // Return the response to JSON
    return response;
  } catch (error) {
    if (error instanceof Error) throw new TypeError(`${error.message}`);
    return;
  }
};
