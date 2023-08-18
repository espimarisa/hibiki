import type { DiscordProfile } from "@auth/core/providers/discord";
import { sanitizedEnv } from "$shared/env.js";
import discordProvider from "@auth/core/providers/discord";
import { SvelteKitAuth } from "@auth/sveltekit";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const authorization: Handle = async ({ event, resolve }) => {
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
        redirect(303, "/auth/signin");
      }
    }
  }

  return resolve(event);
};

export const handle: Handle = sequence(
  SvelteKitAuth({
    // Session options
    session: {
      maxAge: 604_800,
    },
    providers: [
      // Discord oAuth provider
      discordProvider({
        clientId: sanitizedEnv.BOT_OAUTH_CLIENT_ID,
        clientSecret: sanitizedEnv.BOT_OAUTH_CLIENT_SECRET,
        redirectProxyUrl: sanitizedEnv.BOT_OAUTH_REDIRECT_URI,
        authorization: "https://discord.com/api/oauth2/authorize?scope=identify+guilds",

        // Profile callback
        profile(profile: DiscordProfile) {
          // Gets profile avatar
          if (profile.avatar) {
            const format = profile.avatar.startsWith("a_") ? "gif" : "png";
            profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
          } else {
            const defaultAvatar = Number.parseInt(profile.discriminator) % 5;
            profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
          }

          // Discord profile data
          return {
            id: profile.id,
            name: profile.username,
            discriminator: profile.discriminator,
            image: profile.image_url,
          };
        },
      }),
    ],
    callbacks: {
      // JWT handler
      jwt({ token, account, profile }) {
        if (account) {
          // Sets token data
          token.acccessToken = account.access_token;
          token.tokenType = account.token_type;
        }

        // Returns profile & token data
        if (profile) token.profile = profile;
        return token;
      },

      // Sets session data
      session({ session, token }) {
        const mutatedSession = {
          ...session,
          accessToken: token.accessToken,
          tokenType: token.tokenType,
          discordUser: token.profile,
        };

        return mutatedSession;
      },
    },
  }),
  authorization,
);
