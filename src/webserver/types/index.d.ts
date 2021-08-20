import type { Fasteer } from "@fasteerjs/fasteer";
import type { HibikiClient } from "classes/Client";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// The handler function
export type MiddlewareFunc = (req: FastifyRequest, res: FastifyReply) => Promise<boolean | any>;

// [Method, Path]
export type RouteDef = [string, string];

// Fasteer Controller
export type Controller = Fasteer.FCtrl<
  FastifyInstance,
  {},
  {
    bot: HibikiClient;
  }
>;

export interface SuccessPartial<TData extends object = object> {
  success: true;
  data: TData;
}

export interface RestError {
  kind: string;
  message: string;
}

export interface ErrorPartial {
  success: false;
  error: RestError;
}

export type SuccessOrErrorPartial<TData extends object = object> = SuccessPartial<TData> | ErrorPartial;
