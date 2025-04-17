/**
 * @file Utilities to log to the console and log files.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@/utils/env.js";
import { getDirname } from "@/utils/fs.js";
import { join } from "node:path";
import type { PinoRotateFileOptions } from "@chatsift/pino-rotate-file";
import { multistream, pino, transport } from "pino";
import type { PrettyOptions } from "pino-pretty";

// Gets the directory to store log files in
const CURRENT_DIRECTORY = getDirname(import.meta.url);
const LOGS_DIRECTORY = join(CURRENT_DIRECTORY, "../../logs");

// Options for pino-pretty
const pinoPrettyOptions = {
  colorize: true,
  levelFirst: false,
  translateTime: "SYS:yyyy-mm-dd HH:MM:ss TT",
} satisfies PrettyOptions;

// Options for log rotation
const pinoRotateFileOptions = {
  dir: LOGS_DIRECTORY,
  maxAgeDays: 14,
  mkdir: true,
} satisfies PinoRotateFileOptions;

/** Pino logger to log to stdout. */
export const logger = pino(
  {
    level: "info",
    name: `${env.npm_package_name}/${env.npm_package_version}`,
  },
  multistream([
    {
      level: "info",
      stream: transport({
        options: pinoPrettyOptions,
        target: "pino-pretty",
      }),
    },
    {
      level: "info",
      stream: transport({
        options: pinoRotateFileOptions,
        target: "@chatsift/pino-rotate-file",
      }),
    },
  ]),
);
