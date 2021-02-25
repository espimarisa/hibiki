/**
 * @file Bot logger
 * @description Creates and manages winston loggers
 * @module utils/logger
 */

import { createLogger, format, transports } from "winston";

// Color overrides
const logColors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  yellow: "\x1b[33m",
};

// Formats dates
function dateLogFormat(timestamp: Date) {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  return `${`${logColors.cyan}[`}${month} ${day} ${year} ${time}${`]${logColors.reset}`}`;
}

// Log formatting options
const logFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf((info) => `${dateLogFormat(info.timestamp)} (${info.level}): ${info.message}`),
);

// Creates the logger
export const logger = createLogger({
  format: logFormat,
  transports: [new transports.Console()],
});
