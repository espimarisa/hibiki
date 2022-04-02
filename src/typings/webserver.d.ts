// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as fastify from "fastify";
// A returned profile from Oauth
type DiscordOauthProfile = {
  id: DiscordSnowflake;
  username: string;
  avatar: string | undefined;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | undefined;
  banner_color: string | undefined;
  accent_color: number | undefined;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number | undefined;
};

// Add "config" to FastifyInstance
declare module "fastify" {
  export interface FastifyInstance {
    config: HibikiConfig["webserver"];
  }
}
