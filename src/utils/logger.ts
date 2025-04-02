/**
 * @file Creates a pino logger.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/logger
 */

import { env } from "@/utils/env.js";
import { getDirname } from "@/utils/fs.js";
import { join } from "node:path";
import type { PinoRotateFileOptions } from "@chatsift/pino-rotate-file";
import { multistream, pino, transport } from "pino";
import type { PrettyOptions } from "pino-pretty";

// Gets the directory to store logs into
const CURRENT_DIRECTORY = getDirname(import.meta.url);
const LOGS_DIRECTORY = join(CURRENT_DIRECTORY, "../../logs");

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

// Creates a pino logger
export const logger = pino(
	{
		level: "info",
		name: `${env.npm_package_name}/${env.npm_package_version}`,
	},
	multistream([
		{
			level: "info",
			stream: transport({
				target: "pino-pretty",
				options: pinoPrettyOptions,
			}),
		},
		{
			level: "info",
			stream: transport({
				target: "@chatsift/pino-rotate-file",
				options: pinoRotateFileOptions,
			}),
		},
	]),
);
