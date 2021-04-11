/**
 * @file Bot logger
 * @description Creates and manages winston loggers
 * @module utils/logger
 */

import path from "path";
import * as winston from "winston";
import "winston-daily-rotate-file";
const level = process.env.NODE_ENV === "development" ? "verbose" : "info";
const LOGS_DIRECTORY = path.join(__dirname, "../../logs");

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
function dateLogFormat(timestamp: Date, colors = true) {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  if (colors) return `${`${logColors.cyan}[`}${month} ${day} ${year} ${time}${`]${logColors.reset}`}`;
  else return `${`[${month} ${day} ${year} ${time}]`}`;
}

// Logs to the console
const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => `${dateLogFormat(info.timestamp)} (${info.level}): ${info.message}`),
);

// Logs to files
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => `${dateLogFormat(info.timestamp, false)}: ${info.message}`),
);

// Rotates logs daily
const dailyTransport = new winston.transports.DailyRotateFile({
  filename: "hibiki-%DATE%.log",
  dirname: LOGS_DIRECTORY,
  level: level,
  datePattern: "YYYY-MM-DD",
  handleExceptions: false,
  zippedArchive: true,
  json: false,
  format: logFormat,
  maxSize: "20m",
  maxFiles: "14d",
  auditFile: `${LOGS_DIRECTORY}/hibiki-${level}-audit.json`,
});

// Console logger
const consoleLogger = new winston.transports.Console({
  format: consoleLogFormat,
});

// Creates the logger
export const logger = winston.createLogger({
  transports: [dailyTransport, consoleLogger],
});

// Logs when logs were rotated
dailyTransport.on("rotate", () => {
  logger.info("Daily logs have been rotated.");
});
