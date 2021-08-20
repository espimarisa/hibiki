import type { RequestGenericInterface } from "fastify";

export interface WithId extends RequestGenericInterface {
  Params: {
    id: string;
  };
}

export const withId = {
  params: {
    properties: {
      id: {
        type: "string",
      },
    },
    required: ["id"],
  },
};
