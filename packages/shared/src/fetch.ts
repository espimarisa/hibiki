import { env } from "$shared/env.ts";

export async function hibikiFetch(url: string, options?: RequestInit): Promise<Response | undefined> {
  // Fetches the URL
  try {
    const response: Response | undefined = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,

        // Append the Hibiki user-agent
        "User-Agent": `${env.npm_package_name}/${env.npm_package_version} (github.com/espimarisa/hibiki)`,
      },
    });

    if (!response) {
      return;
    }

    return response;
  } catch (err) {
    throw new Error(Bun.inspect(err));
  }
}
