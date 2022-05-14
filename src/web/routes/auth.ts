/**
 * @file Index routes
 * @description Handles routes for authentication (https://127.0.0.1/auth)
 * @module web/routes/auth
 */

import type { FastifyGenericRouteOptions, FastifyNextFunction, FastifyServer } from "../server.js";

export function authRoutes(app: FastifyServer, _options: FastifyGenericRouteOptions, next: FastifyNextFunction) {
  app.get("/callback", async (req, res) => {
    const token = await app.discordOauth2.getAccessTokenFromAuthorizationCodeFlow(req);
    if (!token) res.status(401).redirect("/");

    req.session.set("token", token);
    await res.redirect("/auth/hello");
  });

  app.get("/auth/hello", async (req, res) => {
    const token = req.session.get("token");
    await res.send({ token: token });
  });

  next();
}
