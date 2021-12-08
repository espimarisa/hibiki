/**
 * @file Server
 * @description Main Hibiki webserver
 * @module web/server
 */

import type { FastifyInstance } from "fastify";
import type { Server, IncomingMessage, ServerResponse } from "node:http";
import { logger } from "../utils/logger";
import { authRoutes } from "./routes/auth";
import { indexRoutes } from "./routes/index";
import { fastify } from "fastify";
import fastifyAccepts from "fastify-accepts";
import fastifyCors from "fastify-cors";
import fastifyCsrf from "fastify-csrf";
import fastifyHelmet from "fastify-helmet";
import fastifySecureSession from "fastify-secure-session";
import fastifyStatic from "fastify-static";
import { Liquid } from "liquidjs";
import crypto from "node:crypto";
import path from "node:path";
import pointOfView from "point-of-view";

const LAYOUTS_DIRECTORY = path.join(__dirname, "layouts");
const PARTIALS_DIRECTORY = path.join(__dirname, "partials");
const PUBLIC_DIRECTORY = path.join(__dirname, "public");
const VIEWS_DIRECTORY = path.join(__dirname, "views");
const isProduction = process.env.NODE_ENV === "production";

const HIBIKI_SECRET = crypto.randomBytes(32).toString();
const HIBIKI_SALT = crypto.randomBytes(16);

export type FastifyServer = FastifyInstance<Server, IncomingMessage, ServerResponse>;

export type FastifyGenericRouteOptions = {
  prefix: string;
};

export type FastifyNextFunction = () => void;

export function startWebserver() {
  const app: FastifyServer = fastify({
    logger: logger,
    disableRequestLogging: true,
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

  app.register(fastifySecureSession, {
    salt: HIBIKI_SALT,
    secret: HIBIKI_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      signed: true,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      // If you are getting infinite redirects, set this to "false" if you don't have a HTTPS-only environment setup.
      secure: isProduction,
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

  app.listen(4000);
}
