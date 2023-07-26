import { sanitizedEnv } from "$shared/env.js";
import discordProvider from "@auth/core/providers/discord";
import { SvelteKitAuth } from "@auth/sveltekit";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

// Checks for authorization on specific routes
// @ts-expect-error This is not currently typed, cry about it
export const authorization = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/api") || event.url.pathname.startsWith("/dashboard")) {
    // Gets the session
    const session = await event.locals.getSession();

    // If there is no session, handle it as unauthorized
    if (!session) {
      // Throw a REST error when accessing the API unauthorized for consistency sake
      if (event.url.pathname.startsWith("/api")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
      } else {
        // Force a re-log for everything else
        throw redirect(303, "/auth/signin");
      }
    }
  }

  return resolve(event);
};

export const handle: Handle = sequence(
  SvelteKitAuth({
    providers: [
      discordProvider({
        clientId: sanitizedEnv.DISCORD_CLIENT_ID,
        clientSecret: sanitizedEnv.DISCORD_CLIENT_SECRET,
        redirectProxyUrl: sanitizedEnv.DISCORD_REDIRECT_URL,
        authorization: { params: { scope: "identify" } },
      }),
    ],
    session: {
      // Roughly 7 days
      maxAge: 604_800,
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        // Sets our access token
        if (account) token.accessToken = account.access_token;

        // Sets our Discord user ID
        if (profile) token.id = profile.id;
        return token;
      },

      // Sets session data
      async session({ session, token }) {
        if (token?.accessToken) session.user.accessToken = JSON.stringify(token.accessToken);
        if (token?.id) session.user.id = token.id as string;
        return session;
      },
    },
  }),
  authorization,
);
