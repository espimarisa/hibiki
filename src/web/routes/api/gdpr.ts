import type { FastifyGenericRouteOptions, FastifyNextFunction, FastifyServer } from "../../server.js";

export function gdprRoutes(app: FastifyServer, options: FastifyGenericRouteOptions, next: FastifyNextFunction) {
  app.get("/api/gdpr", async (req, res) => {});

  next();
}
