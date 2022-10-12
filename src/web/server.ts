/**
 * @file Server
 * @description Hibiki's fastify webserver
 * @module web/server
 */

import { logger } from "../utils/logger.js";
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

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const app = fastify({
  logger: logger,
});

const liquidEngine = new Liquid({
  root: [LAYOUTS_DIRECTORY, PARTIALS_DIRECTORY, VIEWS_DIRECTORY],
  cache: IS_PRODUCTION,
  lenientIf: true,
  jsTruthy: true,
  extname: ".liquid",
});

// @ts-expect-error The typing in this doesn't support NodeNext yet
app.register(pointOfView, {
  root: VIEWS_DIRECTORY,
  viewExt: "liquid",
  engine: {
    liquid: liquidEngine,
  },
});

app.get("/", async (req, res) => {
  await res.view("index");
});

export function startWebserver() {
  app.listen({ port: 4000 });
}
