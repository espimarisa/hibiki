/**
 * @file Creates a pino logger for console and log file output.
 * @license Zlib
 */

import { env } from "@/root/utils/env.ts";
import { getDirname } from "@/utils/fs.ts";
import { join } from "node:path";
import type { PinoRotateFileOptions } from "@chatsift/pino-rotate-file";
import { multistream, pino, transport } from "pino";
import type { PrettyOptions } from "pino-pretty";

// Gets the directory to store log files in.
const CURRENT_DIRECTORY = getDirname(import.meta.url);
const LOGS_DIRECTORY = join(CURRENT_DIRECTORY, "../../logs");

const logLevel = env.NODE_ENV === "development" ? "debug" : "info";

// Options for pino-pretty.
const pinoPrettyOptions = {
  colorize: true,
  levelFirst: false,
  translateTime: "SYS:yyyy-mm-dd HH:MM:ss TT",
} satisfies PrettyOptions;

// Options for log rotation.
const pinoRotateFileOptions = {
  dir: LOGS_DIRECTORY,
  maxAgeDays: 14,
  mkdir: true,
} satisfies PinoRotateFileOptions;

// Creates the pino logger instance.
export const logger = pino(
  {
    level: logLevel,
    name: `${env.npm_package_name}/${env.npm_package_version}`,
  },
  multistream([
    {
      level: logLevel,
      stream: transport({
        options: pinoPrettyOptions,
        target: "pino-pretty",
      }),
    },
    {
      level: logLevel,
      stream: transport({
        options: pinoRotateFileOptions,
        target: "@chatsift/pino-rotate-file",
      }),
    },
  ]),
);
