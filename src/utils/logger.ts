/**
 * @file Logger
 * @description Handles console logging and transports
 * @module utils/logger
 */

import { pino } from "pino";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Creates a new pino logger
 */

const pinoOptions: pino.LoggerOptions = {
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "yyyy-mm-dd HH:MM:ss",
      colorize: true,
    },
  },
};

export const logger = pino(IS_PRODUCTION ? {} : pinoOptions);
