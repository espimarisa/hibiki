import type { LayoutServerLoad } from "./$types.js";

export const load = (async (event) => {
  return {
    session: await event.locals.getSession(),
  };
}) satisfies LayoutServerLoad;
