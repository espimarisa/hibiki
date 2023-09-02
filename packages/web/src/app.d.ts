/* eslint-disable spaced-comment */
/// <reference types="@auth/sveltekit" />

declare namespace App {
  interface User {
    name: string;
    image: string;
  }

  interface Session {
    accessToken?: string;
    tokenType?: tokenType;
    discordUser?: import("@auth/core/providers/discord").DiscordProfile;
    user?: User;
    expires?: Date;
  }

  interface Account {
    token_type?: tokenType;
  }

  interface Profile {
    profile?: DiscordProfile;
  }

  interface JWT {
    accessToken?: string;
    tokenType?: tokenType;
  }

  interface Locals {
    getSession(): Promise<Session | null>;
  }

  interface PageData {
    session: Session | null;
  }
}

type SvelteMetadata = {
  // Page title
  title?: string;

  // Page description
  description?: string;

  // Embed image
  image?: string;

  // Alt text for the image
  imageAlt?: string;

  // Metadata URL
  url?: string;

  // The type of content
  type?: string;

  // A Twitter card URL
  twitterCard?: string;

  // The color to theme browser UI in
  themeColor?: string;
};
