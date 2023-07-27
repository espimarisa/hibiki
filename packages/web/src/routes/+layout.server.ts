import type { LayoutServerLoad } from "./$types.js";

export const load: LayoutServerLoad = async (event) => {
  return {
    session: await event.locals.getSession(),
  };
};
