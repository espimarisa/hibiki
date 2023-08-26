import type { DiscordProfile } from "next-auth/providers/discord";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: tokenType;
    discordUser?: DiscordProfile;
  }

  interface Account {
    token_type?: string;
  }

  interface Profile {
    profile?: DiscordProfile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    tokenType?: string;
  }
}
