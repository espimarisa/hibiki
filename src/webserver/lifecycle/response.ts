import type { FasteerInstance } from "@fasteerjs/fasteer";
import { err, ok } from "../utils/response";

export const decorators = ({ fastify: app }: FasteerInstance) => {
  app.decorateReply("ok", ok);
  app.decorateReply("error", err);

  const createShorthandFunc = (kind: string) => (message?: string) =>
    err({
      kind,
      message: message ?? `${kind.charAt(0).toUpperCase()}${kind.slice(1)}`,
    });

  app.decorateReply("err", {
    input: createShorthandFunc("USER_INPUT"),
    unauthorized: createShorthandFunc("UNAUTHORIZED"),
    forbidden: createShorthandFunc("FORBIDDEN"),
    internal: createShorthandFunc("INTERNAL"),
  });
};
