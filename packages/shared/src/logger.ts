import { sanitizedEnv } from "./env.js";
import { pino } from "pino";

// Options for the pino logger
const pinoOptions: pino.LoggerOptions = {
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "yyyy-mm-dd HH:MM:ss",
      colorize: true,
    },
  },
};

// Creates the new Pino logger
export const logger = pino(sanitizedEnv.isProduction ? {} : pinoOptions);
