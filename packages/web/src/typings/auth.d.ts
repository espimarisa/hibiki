import type { DiscordProfile } from "@auth/core/providers/discord";
type tokenType = "bearer" | "bot";

declare module "@auth/core/types" {
  interface Session {
    accessToken?: string;
    tokenType?: tokenType;
    discordUser?: DiscordProfile;
  }

  interface Account {
    token_type?: tokenType;
  }

  interface Profile {
    profile?: DiscordProfile;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    tokenType?: tokenType;
  }
}
