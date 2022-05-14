/**
 * @file Index routes
 * @description Handles routes for the index page (https://127.0.0.1/)
 * @module web/routes/index
 */

import type { FastifyGenericRouteOptions, FastifyNextFunction, FastifyServer } from "../server.js";
import type { OAuth2Token } from "@fastify/oauth2";
import { getOauthUserProfile } from "../utils/auth.js";

export function indexRoutes(app: FastifyServer, options: FastifyGenericRouteOptions, next: FastifyNextFunction) {
  app.get("/test", async (req, res) => {
    const token: OAuth2Token = req.session.get("token");

    const userData = await getOauthUserProfile(token);

    await res.send({
      token: token,
      user: userData,
    });
  });

  next();
}
