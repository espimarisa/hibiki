import path from "node:path";

import type { PinoRotateFileOptions } from "@chatsift/pino-rotate-file";
import createLogger, { multistream, transport } from "pino";
import type { PrettyOptions } from "pino-pretty";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));

// Directories to crawl
const LOGS_DIRECTORY = path.join(pathDirname, "../../logs");

// Pino-pretty options
const pinoPrettyOptions = {
  levelFirst: true,
  translateTime: "yyyy-mm-dd HH:MM:ss",
  colorize: true,
} satisfies PrettyOptions;

// Pino rotation options
const pinoRotateFileOptions = {
  dir: LOGS_DIRECTORY,
  mkdir: true,
  maxAgeDays: 14,
} satisfies PinoRotateFileOptions;

export const logger = createLogger(
  {
    // Sets name to package name
    // name: env.npm_package_name || undefined,
    level: "trace",
  },
  multistream([
    {
      level: "trace",
      stream: transport({
        target: "pino-pretty",
        options: pinoPrettyOptions,
      }),
    },
    {
      level: "trace",
      stream: transport({
        target: "@chatsift/pino-rotate-file",
        options: pinoRotateFileOptions,
      }),
    },
  ]),
);
