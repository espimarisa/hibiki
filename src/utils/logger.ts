/**
 * @file Pino logger utility.
 * @license zlib
 */

import { IS_DEVELOPMENT, LOGS_DIRECTORY } from "@/utils/constants.ts";
import { join } from "node:path";
import { pino } from "pino";
import type { PrettyOptions } from "pino-pretty";

// Gets the logs directory and the file to write.
const LOG_FILE = join(LOGS_DIRECTORY, "../../logs/hibiki.log");

// Determines the minimum level to log.
const logLevel = IS_DEVELOPMENT ? "debug" : "info";

// Creates the base logger.
const baseLogger = pino({
  level: logLevel,
  transport: {
    targets: [
      {
        // JSON file transport.
        level: logLevel,
        target: "pino-roll",
        options: {
          file: LOG_FILE,
          frequency: "daily",
          maxFiles: 14,
          mkdir: true,
          size: "10M",
        },
      },
      {
        // Prettifier for console output.
        level: logLevel,
        target: "pino-pretty",
        options: {
          colorize: true,
          hideObject: true,
          ignore: "hostname",
          levelFirst: false,
          messageFormat: "[{context}] {msg}",
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        } satisfies PrettyOptions,
      },
    ],
  },
});

// Creates child loggers for use in specific modules.
export const clientLog = baseLogger.child({ context: "CLIENT" });
export const commandLog = baseLogger.child({ context: "COMMAND" });
export const dbLog = baseLogger.child({ context: "DATABASE" });
export const fsLog = baseLogger.child({ context: "FS" });
export const redisLog = baseLogger.child({ context: "REDIS" });
export const sharderLog = baseLogger.child({ context: "SHARDER" });
export const starboardLog = baseLogger.child({ context: "STARBOARD" });
export const i18NLog = baseLogger.child({ context: "i18n" });
export const fetchLog = baseLogger.child({ context: "FETCH" });
