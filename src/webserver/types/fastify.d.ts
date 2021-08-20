import type { Profile } from "passport-discord";

declare module "fastify" {
  interface PassportUser extends Profile {}

  interface FastifyRequest {
    authUser: AuthUser | null;
  }

  export type ShorthandRestErrorFunc = (message?: string) => ErrorPartial;

  interface FastifyReply {
    error: (restError: RestError) => ErrorPartial;

    // data defaults to { message: "ok" }
    ok: <TData extends object = object>(data?: TData) => SuccessPartial<TData>;

    err: {
      input: ShorthandRestErrorFunc;
      unauthorized: ShorthandRestErrorFunc;
      forbidden: ShorthandRestErrorFunc;
      internal: ShorthandRestErrorFunc;
      validation: ShorthandRestErrorFunc;
    };
  }
}
