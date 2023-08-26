import { authOptions } from "$web/app/api/auth/[...nextauth]/route.js";
import { getAPIGuilds } from "$web/utils/api.js";
import { getServerSession } from "next-auth/next";

export default async function page() {
  const session = await getServerSession(authOptions);

  if (session?.accessToken) {
    const guilds = await getAPIGuilds(session.accessToken);
    console.log(guilds?.map((g) => g.name));
  }

  return <pre>{session ? JSON.stringify(session, undefined, 2) : "read if cute"}</pre>;
}
