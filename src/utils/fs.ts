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
import type { Collection } from "discord.js";

/** Validates filetypes for valid ESM modules */
const ESM_FILETYPE_REGEX = /\.(mjs|mts|ts|js)$/i;

/** Typing for expected return of getImportData() */
export type ImportData = {
  name: string;
  resolved: () => Promise<unknown>;
};

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
 */

export async function importDirectory(path: PathLike) {
  // Gets the full directory path and directory listing
  const directoryPath = path.toString();
  const files = await readdir(directoryPath, { withFileTypes: true });
  const importedFiles: ImportData[] = [];

  // Iterates over the files
  for (const file of files) {
    if (file.isDirectory()) {
      continue;
    }

    // Only validate valid ESM modules
    if (!ESM_FILETYPE_REGEX.test(file.name)) {
      continue;
    }

    // Gets the file's full path
    const filePath = join(directoryPath, file.name);

    try {
      // Imports the file and gets either the default export or all exports
      importedFiles.push({
        name: file.name,
        resolved: async () => {
          const module = await import(filePath);
          return module ?? module.default;
        },
      });

      logger.info(`Successfully imported ${file.name}`);
    } catch (err) {
      const error = getError(err);
      logger.error(`Failed to import ${file.name}: ${error.message}`);
      throw new Error(error.stack);
    }
  }

  return importedFiles;
}

/**
 * Returns resolved import data.
 * @param resolved The resolved import to get data from.
 * @returns Resolved import data with filename and contents.
 */

export async function getImportData(resolved: ImportData) {
  // Await resolution of the module
  const module = await resolved.resolved();

  // Ensure the module is valid
  if (!module) {
    return;
  }

  // If there is a single named export, return it
  const exportedValues = Object.values(module);
  if (exportedValues.length === 1) {
    return {
      name: resolved.name,
      resolved: async () => exportedValues[0],
    };
  }

  // If multiple named exports exist, return the entire module
  return {
    name: resolved.name,
    resolved: async () => module,
  };
}

/**
 * Loads modules into a collection.
 * @param directory The directory to load modules from.
 * @param collection The collection to update with loaded modules.
 * @param validator Function to use to validate module validity.
 */

async function loadModules<T>(
  directory: PathLike,
  collection: Collection<string, T>,
  validator: (importData: ImportData) => Promise<boolean>,
) {
  // Scan the directory for files
  const files = await importDirectory(directory);

  // Iterate over the files
  for (const file of files) {
    // Gets import data
    const data = await getImportData(file);
    if (!data) {
      continue;
    }

    // Await the resolved() function to get the actual module
    const resolvedModule = (await data.resolved()) as T;

    // Validate the module
    const isValid = await validator(data);
    if (isValid) {
      // Add the valid module to the collection
      collection.set(data.name.replace(ESM_FILETYPE_REGEX, ""), resolvedModule);
      logger.info(`Module ${data.name} successfully loaded`);
    } else {
      logger.warn(`Module ${data.name} failed validation`);
    }
  }
}

/**
 * Loads and validates slash commands from a directory.
 * @param directory The directory to load slash commands from.
 * @param collection The collection to push slash commands into.
 */

export async function loadSlashCommands(
  directory: PathLike,
  collection: Collection<string, HibikiSlashCommand>,
) {
  logger.info("Loading slash commands...");
  await loadModules<HibikiSlashCommand>(directory, collection, async (data) => {
    const resolvedModule = (await data.resolved()) as HibikiSlashCommand;

    return (
      resolvedModule.data !== undefined &&
      typeof resolvedModule.runCommand === "function"
    );
  });
}

/**
 * Loads and validates event handlers from a directory.
 * @param directory The directory to load event handlers from.
 * @param collection The collection to push event handlers into.
 */

export async function loadEventHandlers(
  directory: PathLike,
  collection: Collection<string, HibikiEventHandlerTypes>,
) {
  // Gets the resolved import data
  logger.info("Loading event handlers...");

  await loadModules<HibikiEventHandlerTypes>(
    directory,
    collection,
    async (data) => {
      const resolved = (await data.resolved()) as HibikiEventHandlerTypes;

      return resolved.runHandler !== undefined && resolved.event !== undefined;
    },
  );
}
