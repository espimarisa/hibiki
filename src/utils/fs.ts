/**
 * @file Utilities for working with the filesystem.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/fs
 */

import { getError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const MODULE_FILETYPE_REGEX = /\.(cjs|mjs|mts|cts|ts|js)$/i;

/**
 * Returns the directory of a URL (__dirname replacement).
 * @param path The URL to get the directory name from.
 * @returns The directory that a file is located in.
 */

export function getDirname(path: string) {
	return dirname(Bun.fileURLToPath(path));
}

/**
 * Imports an entire directory asynchronously.
 * @param path The directory to import files from.
 * @param subfolders If true, allows importing from subfolders.
 */

export async function importDir(path: PathLike, subfolders = false) {
	// Read the directory
	const directoryPath = path.toString();
	const files = await readdir(directoryPath, { withFileTypes: true });

	// Iterate through each file
	for (const file of files) {
		if (file.isDirectory()) {
			// Allow subfolders
			subfolders ? await importDir(join(directoryPath, file.name), true) : null;
			continue;
		}

		// Only process valid ESM module files
		if (!MODULE_FILETYPE_REGEX.test(file.name)) {
			continue;
		}

		// Construct the full path for the file
		const filePath = join(directoryPath, file.name);

		try {
			// Imports the file
			await import(filePath);
			logger.info(`Successfully imported ${file.name}`);
		} catch (err) {
			const error = getError(err);
			logger.error(`Failed to import ${file.name}: ${error.message}`);
			throw new Error(error.cause);
		}
	}
}
