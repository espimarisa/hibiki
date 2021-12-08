/**
 * @file Index routes
 * @description Handles routes for the index page (https://127.0.0.1/)
 * @module web/routes/index
 */

import type { FastifyGenericRouteOptions, FastifyNextFunction, FastifyServer } from "../server";

export function indexRoutes(app: FastifyServer, options: FastifyGenericRouteOptions, next: FastifyNextFunction) {
  app.get("/", async (request, response) => {
    await response.view("index");
  });

  next();
}
