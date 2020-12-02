/**
 * @file Logger
 * @description Creates and manages winston loggers
 * @author Espi <contact@espi.me>
 * @module helpers/logger
 */

import { createLogger, format, transports } from "winston";
import { formatLogDate } from "./format";

// TODO: Implement winstonDailyRotateFile

// Log formatting options
const logFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf((info) => `${formatLogDate(info.timestamp)} (${info.level}): ${info.message}`),
);

// Creates our loggers
export const botLogger = createLogger({
  format: logFormat,
  transports: [new transports.Console()],
});
