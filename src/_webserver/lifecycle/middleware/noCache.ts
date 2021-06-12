import type { RouteDef } from "_webserver/types";
import { onlyRoutes } from "_webserver/utils";

const ONLY_ROUTES: RouteDef[] = [["GET", "/todo"]];

export const noCacheMiddleware = onlyRoutes(
  async (req, res) => {
    res.header("Cache-Control", "no-cache");
  },
  ONLY_ROUTES,
  true,
);
