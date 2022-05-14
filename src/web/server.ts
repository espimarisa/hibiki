/**
 * @file Server
 * @description Main Hibiki webserver
 * @module web/server
 */

import type { FastifyInstance } from "fastify";
import type { Server, IncomingMessage, ServerResponse } from "node:http";
import config from "../../config.js";
import { logger } from "../utils/logger.js";
import { authRoutes } from "./routes/auth.js";
import { indexRoutes } from "./routes/index.js";
import fastifyAccepts from "@fastify/accepts";
import { fastifyCookie } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyCsrf from "@fastify/csrf";
import { fastifyHelmet } from "@fastify/helmet";
import { fastifyOauth2 } from "@fastify/oauth2";
import fastifySession from "@fastify/session";
import fastifyStatic from "@fastify/static";
import { fastify } from "fastify";
import { Liquid } from "liquidjs";
import pointOfView from "point-of-view";
import path from "node:path";

const LAYOUTS_DIRECTORY = path.join(__dirname, "layouts");
const PARTIALS_DIRECTORY = path.join(__dirname, "partials");
const PUBLIC_DIRECTORY = path.join(__dirname, "public");
const VIEWS_DIRECTORY = path.join(__dirname, "views");
const isProduction = process.env.NODE_ENV === "production";

export type FastifyServer = FastifyInstance<Server, IncomingMessage, ServerResponse>;
export type FastifyGenericRouteOptions = { prefix: string };
export type FastifyNextFunction = () => void;

export function startWebserver() {
  const app: FastifyServer = fastify({
    logger: logger,
    disableRequestLogging: true,
  });

  // Registers fastifyCookie
  app.register(fastifyCookie, { secret: config.webserver.sessionSecret });

  // Registers fastifySession
  // @ts-expect-error remove me in a minute
  app.register(fastifySession, {
    secret: config.webserver.sessionSecret,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      // signed: true,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      // If you're getting infinite redirects and *NOT* running in HTTPS mode, set this to false
      secure: isProduction,
    },
  });

  // Registers oauth2 plugin
  app.register(fastifyOauth2, {
    name: "discordOauth2",
    callbackUri: config.webserver.callbackURI,
    startRedirectPath: "/auth",
    scope: ["identify", "guilds"],
    credentials: {
      auth: fastifyOauth2.DISCORD_CONFIGURATION,
      client: {
        id: config.webserver.clientID,
        secret: config.webserver.clientSecret,
      },
    },
  });

  // Creates a new Liquid engine
  const liquidEngine = new Liquid({
    root: [VIEWS_DIRECTORY, PARTIALS_DIRECTORY, LAYOUTS_DIRECTORY],
    cache: isProduction,
    lenientIf: true,
    jsTruthy: true,
    extname: ".liquid",
  });

  // Enables Helmet
  app.register(fastifyHelmet, {
    hidePoweredBy: true,
    enableCSPNonces: true,
    contentSecurityPolicy: {
      directives: {
        ...fastifyHelmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "cdn.discordapp.com", "data:"],
        "script-src": ["'self'"],
      },
    },
  });

  // Enables CORS
  app.register(fastifyCors, {
    credentials: true,
  });

  // Registers accepts and csrf
  app.register(fastifyAccepts);
  app.register(fastifyCsrf);

  // Registers point-of-view
  app.register(pointOfView, {
    viewExt: "liquid",
    root: VIEWS_DIRECTORY,
    engine: {
      liquid: liquidEngine,
    },
  });

  // Registers fastify-static
  app.register(fastifyStatic, {
    root: PUBLIC_DIRECTORY,
    prefix: "/",
  });

  // Registers routes
  app.register(indexRoutes, { prefix: "/" });
  app.register(authRoutes, { prefix: "/auth" });

  app.config = config.webserver;

  app.listen(config.webserver.port ?? 4000);
}
