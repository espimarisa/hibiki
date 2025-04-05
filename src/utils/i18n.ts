/**
 * @file Initializes i18next and localizes locale dictionary keys.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/i18n
 */

import { getError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import i18n from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

let localeDirectoryData: string[] = [];

export async function initI18N(directory: PathLike) {
  try {
    // Gets the contents of the directory
    logger.info("Initializing i18next...");
    const directoryPath = directory.toString();
    localeDirectoryData = await getLocaleFiles(directoryPath);

    // Starts i18next
    await i18n.use(i18NexFsBackend).init<FsBackendOptions>({
      backend: {
        loadPath: `${directoryPath}/{{lng}}/{{ns}}.json`,
      },
      defaultNS: "common",
      fallbackLng: "en-US",
      initAsync: true,
      interpolation: {
        skipOnVariables: false,
      },
      preload: localeDirectoryData,
      lng: "en-US",
      load: "currentOnly",
      ns: ["command", "common", "error"],
    });

    logger.info("Successfully initialized i18next");
  } catch (err) {
    const error = getError(err);
    logger.error(`Error initializing i18next: ${error.message}`);
    throw new Error(error.stack);
  }
}

/**
 * Reads locale files from a directory.
 * @param directory The directory to search for locales in.
 * @returns An array of locale filenames.
 */

async function getLocaleFiles(directory: string): Promise<string[]> {
  try {
    // Iterates over each file
    const files = await readdir(directory);
    return files;
  } catch (err) {
    const error = getError(err);
    logger.error(`Failed to load locales from ${directory}: ${error.message}`);
    throw new Error(error.stack);
  }
}

/**
 * Returns an object containing all localizations of a key.
 * @param key The key to get all localizations for.
 * @returns An object containing all translations of a key.
 */

export function tMap(key: DictionaryKey) {
  const translations: Record<string, string> = {};

  // Iterates through each locale
  for (const locale of localeDirectoryData) {
    try {
      // Sets the translated locale
      const translation = i18n.t(key, { lng: locale });
      translations[locale] = translation;
    } catch (err) {
      logger.warn(`Failed to get translation for ${key} in locale ${locale}`);
    }
  }

  return translations;
}

/** Shorthand for i18n.t. Returns a localized string. */
export const t = i18n.t;
