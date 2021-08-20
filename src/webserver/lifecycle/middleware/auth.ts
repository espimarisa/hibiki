import { UnauthorizedException } from "@fasteerjs/exceptions";
import type { preHandlerHookHandler, RouteShorthandOptions } from "fastify";

export const authMiddleware: preHandlerHookHandler = async (req) => {
  if (!req.user) {
    throw new UnauthorizedException("You are not authenticated.");
  }
};

export const withAuth = (opts?: RouteShorthandOptions): RouteShorthandOptions => ({
  ...(opts ?? {}),
  preHandler: (req, res, done) => {
    if (!req.user) {
      throw new UnauthorizedException("You are not authenticated.");
    }

    typeof opts?.preHandler === "function" && opts.preHandler.call(this, req, res, done);
  },
});
