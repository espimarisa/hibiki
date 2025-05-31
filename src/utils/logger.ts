/**
 * @file Pino logger utility.
 * @license zlib
 */

import { join } from "node:path";
import { pino } from "pino";
import type { PrettyOptions } from "pino-pretty";
import { IS_DEVELOPMENT } from "@/utils/constants.ts";
import { getDirname } from "@/utils/fs.ts";

// Gets the logs directory and the file to write.
const ROOT_DIRECTORY = getDirname(import.meta.url);
const LOGS_DIRECTORY = join(ROOT_DIRECTORY, "../../logs");
const LOG_FILE = join(LOGS_DIRECTORY, "hibiki.log");

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
export const valkeyLog = baseLogger.child({ context: "VALKEY" });
export const sharderLog = baseLogger.child({ context: "SHARDER" });
export const starboardLog = baseLogger.child({ context: "STARBOARD" });
export const i18NLog = baseLogger.child({ context: "i18n" });
export const fetchLog = baseLogger.child({ context: "FETCH" });
