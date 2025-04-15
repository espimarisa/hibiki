/**
 * @file Utilities for working with the filesystem.
 * @author Espi Marisa
 * @license zlib
 */

import { parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Collection } from "discord.js";

/** Typing for loadModules() result */
export type ModuleLoadStats = {
  loaded: number;
  failed: number;
  skipped: number;
};

/** Typing for expected return of getImportData() */
export type ImportData = {
  name: string;
  resolved: () => Promise<unknown>;
};

/** A collection of valid commands loaded from the filesystem. */
export const hibikiCommands = new Collection<string, HibikiCommand>();

/** A collection of valid event handlers loaded from the filesystem. */
export const hibikiEvents = new Collection<
  string,
  HibikiEvent<HibikiEventTypes>
>();

/** Validates filetypes for valid ESM modules */
const ESM_FILETYPE_REGEX = /\.(mjs|mts|ts|js)$/i;

/**
 * Returns the directory of a URL (__dirname replacement).
 * @param directory The URL to get the directory name from.
 * @returns The directory path to a file.
 */

export function getDirname(directory: string) {
  return dirname(Bun.fileURLToPath(directory));
}

/**
 * Recursively imports an entire directory asynchronously.
 * @param directory The directory to import files from.
 * @param recursive If set, loads imports recursively.
 * @returns A list of ImportData objects.
 */

export async function importDirectory(directory: PathLike, recursive = false) {
  const directoryPath = directory.toString();
  const files = await readdir(directoryPath, { withFileTypes: true });
  const importedFiles: ImportData[] = [];

  const importTasks = files.map(async (file) => {
    // Gets the full path of the file
    const filePath = join(directoryPath, file.name);

    // Scan subdirectories if recursive is set
    if (file.isDirectory()) {
      if (recursive === false) {
        return;
      }

      const subFiles = await importDirectory(filePath);
      importedFiles.push(...subFiles);
      return;
    }

    // Do not load non-module files
    if (!ESM_FILETYPE_REGEX.test(file.name)) {
      return;
    }

    try {
      // Prepares the import
      importedFiles.push({
        name: file.name,
        resolved: async () => {
          const module = await import(filePath);
          return module;
        },
      });
    } catch (err) {
      const error = parseError(err);
      logger.error(
        `Failed to prepare import for ${file.name}: ${error.message}`,
      );
    }
  });

  // Settles all tasks and returns the imports
  await Promise.allSettled(importTasks);
  return importedFiles;
}

/**
 * Returns resolved import data.
 * @param resolved The resolved import to get data from.
 * @returns Resolved import data with filename and contents.
 */

export async function getImportData(resolved: ImportData) {
  const module = await resolved.resolved();
  if (!module) {
    return;
  }

  // Load default exports
  if (module && typeof module === "object" && "default" in module) {
    return {
      name: resolved.name,
      resolved: async () => (module as { default: unknown }).default,
    };
  }

  // Loads each exported export
  const exportedValues = Object.values(module);
  if (exportedValues.length === 1) {
    return {
      name: resolved.name,
      resolved: async () => exportedValues[0],
    };
  }

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
 * @returns ModuleLoadStats containing load results.
 */

export async function loadModules<T>(
  directory: PathLike,
  collection: Collection<string, T>,
  validator: (importData: ImportData) => Promise<boolean>,
) {
  // Scans the directory for files
  const files = await importDirectory(directory);
  let loaded = 0;
  let failed = 0;
  let skipped = 0;

  // Gets import data for each file
  const loadTasks = files.map(async (file) => {
    try {
      const data = await getImportData(file);
      if (!data) {
        skipped++;
        return;
      }

      // Checks module validation
      const resolvedModule = (await data.resolved()) as T;
      const isValid = await validator(data);

      if (isValid) {
        // Loads valid modules
        const key = data.name.replace(ESM_FILETYPE_REGEX, "");
        collection.set(key, resolvedModule);
        logger.info(`Successfully imported ${data.name}`);
        loaded++;
      } else {
        // Skips valid modules
        logger.error(`${data.name} failed validation`);
        skipped++;
      }
    } catch (err) {
      const error = parseError(err);
      logger.error(`Failed to load ${file.name}: ${error.message}`);
      failed++;
    }
  });

  // Return loaded module stats
  await Promise.allSettled(loadTasks);
  return { loaded, failed, skipped };
}

/**
 * Loads and validates commands from a directory.
 * @param directory The directory to load user commands from.
 * @param collection The collection to push commands into.
 */

export async function loadCommands(
  directory: PathLike,
  collection: Collection<string, HibikiCommand>,
) {
  logger.info("Loading commands...");

  // Gets the resolved import data
  await loadModules<HibikiCommand>(directory, collection, async (data) => {
    const resolvedModule = (await data.resolved()) as HibikiCommand;

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

export async function loadEvents(
  directory: PathLike,
  collection: Collection<string, HibikiEventTypes>,
) {
  logger.info("Loading event handlers...");

  // Gets the resolved import data
  await loadModules<HibikiEventTypes>(directory, collection, async (data) => {
    const resolved = (await data.resolved()) as HibikiEvent<HibikiEventTypes>;
    return resolved.runEvent !== undefined && resolved.event !== undefined;
  });
}
