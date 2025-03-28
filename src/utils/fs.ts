/**
 * @file Utilities for interacting with the local filesystem.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/fs
 */

import type { PathLike } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { MODULE_FILETYPE_REGEX } from "@/utils/constants.ts";

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
			// Imports the file
			import(`${directory}/${file}`);
			// console.info(`Successfully imported ${file}`);
		} catch (error) {
			// Log our errors like the good person we are
			// console.error(`Failed to import ${file}:`);
			throw new Error(Bun.inspect(error));
		}
	}
}
