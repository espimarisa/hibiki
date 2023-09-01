import type { PageServerLoad } from "./$types.js";

export const load = (async ({ parent }) => {
  const { session } = await parent();

  if (session) {
    console.log(session.discordUser);
  }
}) satisfies PageServerLoad;
