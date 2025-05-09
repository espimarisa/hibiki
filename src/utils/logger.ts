/**
 * @file Logging utilities wrapping around Pino.
 * @license Zlib
 */

import { env } from "@/utils/env";
import { getDirname } from "@/utils/fs";
import { join, resolve as resolvePath } from "node:path";
import { type LoggerOptions, pino, type TransportTargetOptions } from "pino";
import type { PrettyOptions } from "pino-pretty";

// Gets the logs directory and the file to write.
const CURRENT_DIRECTORY = getDirname(import.meta.url);
const LOGS_DIRECTORY = resolvePath(CURRENT_DIRECTORY, "../../logs");
const LOG_FILE = join(LOGS_DIRECTORY, "hibiki.log");

// Determines the minimum level to log based on the environment.
const logLevel = env.NODE_ENV === "development" ? "debug" : "info";
const targets: TransportTargetOptions[] = [];

// JSON file rotation transport; always active.
targets.push({
  level: logLevel,
  target: "pino-roll",
  options: {
    file: LOG_FILE,
    frequency: "daily",
    maxFiles: 14,
    mkdir: true,
    size: "10M",
  },
});

// Pino-pretty transport for console output in development mode.
if (env.NODE_ENV === "development") {
  targets.push({
    level: logLevel,
    target: "pino-pretty",
    options: {
      colorize: true,
      hideObject: true,
      ignore: "pid,hostname",
      levelFirst: false,
      messageFormat: "[{context}] {msg}",
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
    } satisfies PrettyOptions,
  });
}

// Creates the main transport stream and base logger.
const transport = pino.transport({ targets });
const baseLoggerOptions: LoggerOptions = { level: logLevel };
const baseLogger = pino(baseLoggerOptions, transport);

// Creates child loggers with prefixes. This seems bad, but actually isn't! :)
export const clientLog = baseLogger.child({ context: "CLIENT" });
export const commandLog = baseLogger.child({ context: "COMMAND" });
export const dbLog = baseLogger.child({ context: "DATABASE" });
export const loaderLog = baseLogger.child({ context: "LOADER" });
export const redisLog = baseLogger.child({ context: "REDIS" });
export const sharderLog = baseLogger.child({ context: "SHARDER" });
export const starboardLog = baseLogger.child({ context: "STARBOARD" });
export const i18nLog = baseLogger.child({ context: "i18n" });
export const fetchLog = baseLogger.child({ context: "FETCH" });
