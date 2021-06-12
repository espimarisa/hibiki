import type { RouteDef } from "_webserver/types";
import { onlyRoutes } from "_webserver/utils";

const ONLY_ROUTES: RouteDef[] = [];

export const authMiddleware = onlyRoutes(async (req, res) => {
  // TODO: implement auth
}, ONLY_ROUTES);
