/**
 * @file Utilities for interacting with the local filesystem.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/fs
 */

import type { PathLike } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { loaderLogger } from "./logger.js";

const MODULE_FILETYPE_REGEX = /\.(cjs|mjs|js|mts|cts|ts)$/i;

/**
 * Returns the directory of a URL (__dirname replacement).
 * @param url The URL to get the directory name from.
 * @returns The directory that a file is located in.
 */

export function getDirname(url: string) {
	return path.dirname(Bun.fileURLToPath(url));
}

/**
 * Imports an entire directory.
 * @param directory The directory to scan and import.
 */

export async function importDirectory(directory: PathLike) {
	const files = await fs.readdir(directory.toString(), { recursive: true });

	// Iterate through each file; only load modules
	for (const file of files) {
		if (!MODULE_FILETYPE_REGEX.test(file)) {
			continue;
		}

		try {
			await import(`${directory}/${file}`);
			loaderLogger.info(`Successfully imported ${file}`);
		} catch (error) {
			loaderLogger.error(`Failed to import ${file}:`);
			throw new Error(Bun.inspect(error));
		}
	}
}

/**
 * Generates a clean filename without an extension.
 * @param fileName The filename to remove the extension from.
 * @returns A filename without the extension.
 */

export function cleanFileName(fileName: string) {
	return fileName.replace(MODULE_FILETYPE_REGEX, "");
}
