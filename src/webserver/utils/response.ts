import type { ErrorPartial, RestError, SuccessPartial } from "../types";

export const DEFAULT_OK = { message: "ok" };

export const ok = (data = DEFAULT_OK): SuccessPartial<typeof data> => ({
  success: true,
  data,
});

export const err = (error: RestError): ErrorPartial => ({
  success: false,
  error,
});
