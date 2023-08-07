import type { PageServerLoad } from "./$types.js";
import { getAPIGuilds } from "../utils/api.js";

export const load: PageServerLoad = async ({ parent }) => {
  const { session } = await parent();

  if (session?.accessToken) {
    const userGuilds = getAPIGuilds(session.accessToken);
    console.log(userGuilds);
  }
};
