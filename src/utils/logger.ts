/**
 * @file Bot logger
 * @description Creates and manages winston loggers
 * @module utils/logger
 */

import { createLogger, format, transports } from "winston";
import { dateFormat } from "../utils/format";

// Log formatting options
const logFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf((info) => `${dateFormat(info.timestamp, true)} (${info.level}): ${info.message}`),
);

// Creates the logger
export const logger = createLogger({
  format: logFormat,
  transports: [new transports.Console()],
});
