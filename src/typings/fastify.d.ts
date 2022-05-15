/**
 * @file Fastify
 * @description Custom typings for fastify
 * @typedef fastify
 */

import type { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    discordOauth2: OAuth2Namespace;
  }
}
