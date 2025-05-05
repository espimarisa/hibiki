/**
 * @file Utilities for loading modules from the filesystem (Optimized).
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import type { HibikiEvent, HibikiListener } from "@/helpers/event.ts";
import { parseError } from "@/utils/error.ts";
import { logger } from "@/utils/logger.ts";
import type { Dirent, PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import type { Collection } from "discord.js";

const ESM_FILETYPE_REGEX = /\.(mjs|mts|ts|js)$/i;

// Typing for imported module result information.
type ModuleImportResult = {
  filePath: string;
  reason?: Error;
  status: "fulfilled" | "rejected";
  value?: unknown;
};

// Statistics returned by the module loader.
type ModuleLoadStats = {
  failed: number;
  loaded: number;
  skipped: number;
};

/**
 * Returns the directory of a URL (__dirname replacement).
 * @param importMetaUrl The `import.meta.url` of the calling module.
 * @returns The directory path of the file.
 */

export function getDirname(importMetaUrl: string): string {
  return dirname(Bun.fileURLToPath(importMetaUrl));
}

/**
 * Extracts the primary export from a module.
 * @param module The module to extract an import from.
 * @returns The primary export from a module.
 */

function extractPrimaryExport(module: unknown) {
  if (!module || typeof module !== "object") {
    return module;
  }

  // Returns the default module.
  if ("default" in module) {
    return (module as { default: unknown }).default;
  }

  // Gets each exported export; returns the first one.
  const exports = Object.values(module);
  if (exports.length === 1) {
    return exports[0];
  }

  return module;
}

/**
 * Imports all ESM modules in a directory recursively.
 * @param directory The directory path to scan.
 * @param recursive If set, scans subdirectories recursively.
 * @returns A promise resolving to an array of module import results.
 */

async function importModules(directory: PathLike, recursive = false) {
  const directoryPath = directory.toString();
  let files: Dirent[];

  try {
    // Reads each file.
    files = await readdir(directoryPath, { withFileTypes: true });
  } catch (err) {
    const error = parseError(err);
    logger.error(`Failed to read directory ${directoryPath}: ${error.message}`);
    return [];
  }

  // Creates an array of promises.
  const promises: Promise<ModuleImportResult | ModuleImportResult[]>[] = [];

  // Iterates through each module file.
  for (const file of files) {
    const filePath = join(directoryPath, file.name);

    // Store the promise for recursive results.
    if (file.isDirectory() && recursive) {
      promises.push(importModules(filePath, recursive));
    } else if (file.isFile() && ESM_FILETYPE_REGEX.test(file.name)) {
      // Create a promise for importing the file.
      const importPromise = import(filePath)
        .then((moduleContent) => ({
          filePath,
          status: "fulfilled" as const,
          value: moduleContent,
        }))
        .catch((err) => {
          const error = parseError(err);
          logger.error(`Failed to import module ${filePath}: ${error.message}`);
          return {
            filePath,
            reason: error,
            status: "rejected" as const,
          };
        });

      promises.push(importPromise);
    }
  }

  // Wait for all imports/recursions to settle.
  const settledResults = await Promise.allSettled(promises);
  const finalResults: ModuleImportResult[] = [];

  for (const result of settledResults) {
    if (result.status === "fulfilled") {
      // If fulfilled, the value could be a single result or an array from recursion.
      if (Array.isArray(result.value)) {
        finalResults.push(...result.value);
      } else {
        finalResults.push(result.value);
      }
    } else {
      const error = parseError(result.reason);
      logger.error(`Error processing directory structure: ${error.message}`);
    }
  }

  return finalResults;
}

/**
 * Loads modules from a directory into a collection.
 * @param directory The directory path to load modules from.
 * @param collection The collection to populate.
 * @param validator A function returning true if a module is valid to import.
 * @param recursive Whether to load modules recursively. Default: true.
 * @returns Statistics about the loading process.
 */

export async function loadModules<T>(
  directory: PathLike,
  collection: Collection<string, T>,
  validator: (
    moduleExport: unknown,
    filePath: string,
  ) => Promise<boolean> | boolean,
  recursive = true,
) {
  // Imports each file.
  const importResults = await importModules(directory, recursive);
  const stats: ModuleLoadStats = { loaded: 0, failed: 0, skipped: 0 };

  // Process the results sequentially.
  for (const result of importResults) {
    const fileName = basename(result.filePath);

    // Handle failed imports.
    if (result.status === "rejected") {
      stats.failed++;
      continue;
    }

    // Handle successfully imported modules.
    try {
      const primaryExport = extractPrimaryExport(result.value);
      const isValid = await validator(primaryExport, result.filePath); // Await validator

      if (isValid) {
        const key = fileName.replace(ESM_FILETYPE_REGEX, "");
        // Assume validator confirmed structure, cast to T.
        collection.set(key, primaryExport as T);
        stats.loaded++;
        logger.info(`Successfully loaded ${fileName}`);
      } else {
        stats.skipped++;
        logger.warn(`${fileName} failed validation, skipping.`);
      }
    } catch (err) {
      stats.failed++;
      const error = parseError(err);
      logger.error(`Failed to validate ${fileName}: ${error.message}`);
    }
  }

  return stats;
}

/**
 * Loads commands from a directory.
 * @param directory The directory to load commands from.
 * @param collection The collection to insert loaded commands into.
 * @returns A boolean indicating success or failure.
 */

export function loadCommands(
  directory: PathLike,
  collection: Collection<string, HibikiCommand>,
): Promise<ModuleLoadStats> {
  logger.info("Loading commands...");

  const validator = (moduleExport: unknown) => {
    if (!isHibikiCommand(moduleExport)) {
      return false;
    }

    return true;
  };

  return loadModules<HibikiCommand>(directory, collection, validator);
}

/**
 * Loads events from a directory.
 * @param directory The directory to load event listeners from.
 * @param collection The collection to insert loaded event listeners into.
 * @returns A boolean indicating success or failure.
 */

export function loadEvents(
  directory: PathLike,
  collection: Collection<string, HibikiEvent<HibikiListener>>,
) {
  logger.info("Loading event listeners...");

  const validator = (moduleExport: unknown): boolean => {
    if (!isHibikiEvent(moduleExport)) {
      return false;
    }

    return true;
  };

  return loadModules<HibikiEvent<HibikiListener>>(
    directory,
    collection,
    validator,
  );
}

/**
 * Helper type guard to validate a Hibiki slash command.
 * @param obj The object to validate.
 * @returns A boolean indicating success or failure.
 */

function isHibikiCommand(obj: unknown): obj is HibikiCommand {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "data" in obj &&
    "run" in obj &&
    typeof (obj as HibikiCommand).run === "function"
  );
}

/**
 * Helper type guard to validate a Hibiki event.
 * @param obj The object to validate.
 * @returns A boolean indicating success or failure.
 */

function isHibikiEvent(obj: unknown): obj is HibikiEvent<HibikiListener> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "event" in obj &&
    typeof obj.event === "string" &&
    "handle" in obj &&
    typeof obj.handle === "function"
  );
}
