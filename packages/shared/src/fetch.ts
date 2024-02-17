import env from "$shared/env.ts";

export default async (url: string, options?: RequestInit) => {
  if (!url) return;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "User-Agent": `${env.npm_package_name}/${env.npm_package_version} (github.com/espimarisa/hibiki)`,
      },
    });

    // Return the response to JSON
    return response;
  } catch (error) {
    if (error) throw new Error(Bun.inspect(error));
    return;
  }
};
