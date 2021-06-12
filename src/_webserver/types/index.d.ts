import type { FastifyRequest, FastifyReply } from "fastify";

// The handler function
export type MiddlewareFunc = (req: FastifyRequest, res: FastifyReply) => Promise<boolean | any>;

// [Method, Path]
export type RouteDef = [string, string];
