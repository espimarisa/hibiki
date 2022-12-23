/**
 * @file Server
 * @description Hibiki's fastify webserver
 * @module web/server
 */

import { hibikiVersion } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import pointOfView from "@fastify/view";
import { fastify } from "fastify";
import { Liquid } from "liquidjs";
import path from "node:path";
import url from "node:url";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

// Directories to crawl
const LAYOUTS_DIRECTORY = path.join(pathDirname, "./layouts");
const PARTIALS_DIRECTORY = path.join(pathDirname, "./partials");
const VIEWS_DIRECTORY = path.join(pathDirname, "./views");
const STATIC_DIRECTORY = path.join(pathDirname, "./public");

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const app = fastify({
  logger: logger,
  disableRequestLogging: true,
});

// Creates a new Liquid engine
const liquidEngine = new Liquid({
  root: [LAYOUTS_DIRECTORY, PARTIALS_DIRECTORY, VIEWS_DIRECTORY],
  cache: IS_PRODUCTION,
  lenientIf: true,
  jsTruthy: true,
  extname: ".liquid",
});

// Enables CORS
app.register(fastifyCors, {
  credentials: true,
});

// Registers fastify-static
app.register(fastifyStatic, {
  root: STATIC_DIRECTORY,
  prefix: "/",
});

// Registers point-of-view for template processing
app.register(pointOfView, {
  root: VIEWS_DIRECTORY,
  viewExt: "liquid",
  engine: {
    liquid: liquidEngine,
  },
});

// Renders the index page
app.get("/", async (_req, res) => {
  await res.view("index", {
    // The current version of Hibiki
    hibikiVersion: hibikiVersion,
  });
});

/**
 * Starts the webserver
 * @param port The port to listen on
 */

export function startWebserver(port = 4000) {
  app.listen({ host: "0.0.0.0", port: port });
}
