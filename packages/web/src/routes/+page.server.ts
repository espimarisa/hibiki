import { getAPIGuilds } from "../utils/api.js";

export const load = async ({ parent }) => {
  const { session } = await parent();

  if (session?.accessToken) {
    const userGuilds = getAPIGuilds(session.accessToken);
    console.log(userGuilds);
  }
};
