import type { RouteDef } from "_webserver/types";
import { exceptRoutes } from "_webserver/utils/onlyRoutes";

const EXCEPT_ROUTES: RouteDef[] = [
  // Routes that don't require authentication
];

export const authMiddleware = exceptRoutes(async (req, res) => {
  // TODO: implement auth
}, EXCEPT_ROUTES);
