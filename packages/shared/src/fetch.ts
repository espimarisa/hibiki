import { env } from "$shared/env.ts";

export async function fetch(url: string, options?: RequestInit): Promise<Response | undefined> {
  if (!url) {
    return;
  }

  try {
    // Fetches the URL
    const response: Response | undefined = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,

        // Append the Hibiki user-agent
        "User-Agent": `${env.npm_package_name}/${env.npm_package_version} (github.com/espimarisa/hibiki)`,
      },
    });

    // Return the response
    return response;
  } catch (error) {
    if (error) {
      throw new Error(Bun.inspect(error));
    }

    return;
  }
}
