/**
 * @file Index routes
 * @description Handles routes for authentication (https://127.0.0.1/auth)
 * @module web/routes/auth
 */

import type { FastifyGenericRouteOptions, FastifyNextFunction, FastifyServer } from "../server";

export function authRoutes(app: FastifyServer, options: FastifyGenericRouteOptions, next: FastifyNextFunction) {
  next();
}
