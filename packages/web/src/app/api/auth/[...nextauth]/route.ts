import type { NextAuthOptions } from "next-auth";
import type { DiscordProfile } from "next-auth/providers/discord";
import { sanitizedEnv } from "$shared/env.js";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    // @ts-expect-error This isn't actually an error
    DiscordProvider({
      clientId: sanitizedEnv.BOT_CLIENT_ID,
      clientSecret: sanitizedEnv.BOT_OAUTH_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
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
        token.accessToken = account.access_token;
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
};

// @ts-expect-error This isn't actually an error
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
