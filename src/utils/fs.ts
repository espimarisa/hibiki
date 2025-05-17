/**
 * @file Utilities interacting with the filesystem.
 * @license zlib
 */

import { MODULE_FILETYPE_REGEX } from "@/utils/constants.ts";
import { fsLog } from "@/utils/logger.ts";
import type { ObjectEncodingOptions, PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { captureException } from "@sentry/bun";
import type { ClientEvents, Collection } from "discord.js";

// Valid fs.readdir() options.
type ReaddirOptions = ObjectEncodingOptions & {
  recursive?: boolean;
  withFileTypes?: boolean;
};

// Expected structure of an ESM import.
type ESMImport = {
  default?: unknown;
  [key: string]: unknown;
};

/**
 * Imports ESM modules from a directory.
 * @param directory The directory to import modules from.
 * @param recursive If set, runs the importer recursively. Defaults to true.
 * @returns A promise resolving to a map of imported modules, keyed by filename.
 */

export async function importDirectory(directory: PathLike, recursive = true) {
  const importedModules = new Map<string, unknown>();
  const basePath = directory.toString();
  fsLog.debug(`Importing modules from ${basePath}.`);

  // Options to use for fs.readdir.
  const readdirOptions = {
    encoding: "utf-8",
    recursive: recursive ?? true,
    withFileTypes: true,
  } satisfies ReaddirOptions;

  // Reads the directory for files.
  const files = await readdir(basePath, readdirOptions);

  // Iterates through each file.
  for (const file of files) {
    const filePath = join(file.parentPath ?? basePath, file.name);
    const fileName = file.name
      .replace(MODULE_FILETYPE_REGEX, "")
      .replace(/\\/g, "/");

    // Only attempt to import files that match ESM filetypes.
    if (file.isFile() && MODULE_FILETYPE_REGEX.test(file.name)) {
      try {
        // Imports the module.
        const importedFile: ESMImport = await import(filePath);
        let extractedExport: unknown;

        // Use the default export if specified.
        if (importedFile.default !== undefined) {
          extractedExport = importedFile.default;
        } else {
          // Filters out the default key to search for named exports.
          const exportKeys = Object.keys(importedFile).filter(
            (key) => key !== "default",
          );

          // Uses the first named export as the module.
          if (exportKeys[0]) {
            // Gets the key of the export and extracts it.
            const firstKey = exportKeys[0];
            extractedExport = importedFile[firstKey];
          } else {
            fsLog.warn(`Module ${fileName} has no exports.`);
          }
        }

        // Adds the extracted import to the set.
        if (extractedExport) {
          importedModules.set(fileName, extractedExport);
          fsLog.debug(`Successfully imported ${fileName}.`);
        }
      } catch (err) {
        fsLog.error(err, `Failed to import ${filePath}.`);
        captureException(err, { extra: { path: filePath } });
      }
    }
  }

  return importedModules;
}

/**
 * Loads commands from a directory.
 * @param directory The directory to load commands from.
 * @param data A Discord.js Collection to store loaded commands in.
 * @returns A promise resolving to the updated collection, or undefined.
 */

export async function loadCommands(
  directory: PathLike,
  data: Collection<string, HibikiCommand>,
) {
  const directoryName = directory.toString();
  fsLog.debug(`Loading commands from ${directoryName}.`);

  // Imports the commands from the directory.
  const importedModules = (await importDirectory(directoryName, true)) as Map<
    string | undefined,
    HibikiCommand | undefined
  >;

  // Do not continue if no valid commands were found.
  if (importedModules.size === 0) {
    fsLog.debug(`No commands found in ${directoryName}.`);
    return;
  }

  // Iterates over each command entry.
  for (const [commandName, command] of importedModules.entries()) {
    // Loads the command.
    if (typeof command === "object" && command.setData) {
      const commandData = command.setData();
      data.set(commandData.name, command);
      fsLog.debug(`Loaded command ${commandData.name}.`);
    } else {
      fsLog.warn(`Command ${commandName} is invalid, skipping.`);
    }
  }

  // Logs when complete and returns the map.
  fsLog.info(`Loaded ${data.size} commands.`);
  return data;
}

/**
 * Loads event listeners from a directory.
 * @param directory The directory to load event listeners from.
 * @param data A Discord.js Collection to store loaded event handlers in.
 * @returns A promise resolving to the updated collection, or undefined.
 */

export async function loadListeners(
  directory: PathLike,
  data: Collection<string, HibikiListener<keyof ClientEvents>>,
) {
  const directoryName = directory.toString();
  fsLog.debug(`Loading event listeners from ${directoryName}.`);

  // Imports the listeners from the directory.
  const importedModules = (await importDirectory(directoryName)) as Map<
    string | undefined,
    HibikiListener<keyof ClientEvents> | undefined
  >;

  // Do not continue if no valid event listeners were found.
  if (importedModules.size === 0) {
    fsLog.debug(`No event listeners found in ${directoryName}.`);
    return;
  }

  // Iterates over each event listener entry.
  for (const [name, listener] of importedModules.entries()) {
    // Loads the event listener.
    if (typeof listener === "object" && listener.event) {
      data.set(listener.event, listener);
      fsLog.debug(`Loaded event listener for ${listener.event}.`);
    } else {
      fsLog.warn(`Event listener ${name} is invalid, skipping.`);
    }
  }

  // Logs when complete and returns the map.
  fsLog.info(`Loaded ${data.size} event listeners.`);
  return data;
}
