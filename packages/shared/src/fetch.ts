import { hibikiVersion } from "$shared/constants.js";

export default async (url: string, options?: RequestInit): Promise<Response | undefined> => {
  if (!url) return;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": `hibiki/${hibikiVersion} (https://github.com/espimarisa/hibiki)`,
      },
    });

    // Return the response to JSON
    return response;
  } catch (error) {
    if (error instanceof Error) throw new TypeError(`${error.message}`);
  }
};
