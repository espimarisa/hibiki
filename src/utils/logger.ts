/**
 * @file Utilities to perform console logging and debugging.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/logger
 */

import { getDirname } from "@/utils/fs.js";
import type { PinoRotateFileOptions } from "@chatsift/pino-rotate-file";
import { type LoggerOptions, multistream, pino, transport } from "pino";
import type { PrettyOptions } from "pino-pretty";
import path from "node:path";

// Gets the directory to store logs into
const CURRENT_DIRECTORY = getDirname(import.meta.url);
const LOGS_DIRECTORY = path.join(CURRENT_DIRECTORY, "../../logs");

// Pino pretty option
const pinoPrettyOptions = {
	levelFirst: false,
	translateTime: "SYS:yyyy-mm-dd HH:MM:ss TT",
	colorize: true,
} satisfies PrettyOptions;

// Pino rotation options
const pinoRotateFileOptions = {
	dir: LOGS_DIRECTORY,
	mkdir: true,
	maxAgeDays: 14,
} satisfies PinoRotateFileOptions;

/**
 * Wrapper to create a pino logger with a given name.
 * @param name The name to add to the logger.
 * @param options Optional additional pino options.
 * @returns A pino logger module.
 */

export function createLogger(name: string, options?: LoggerOptions) {
	const logger = pino(
		{
			...options,
			name: name,
			level: "trace",
		},

		// Use pino-pretty and store logs on the filesystem in JSON
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

	return logger;
}

// Pre-defined specific loggers
export const shardingLogger = createLogger("SHARDER");
export const loaderLogger = createLogger("LOADER");
export const commandLogger = createLogger("COMMAND");
