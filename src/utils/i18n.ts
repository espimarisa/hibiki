/**
 * @file Creates an i18next instance and handles key localization.
 * @license Zlib
 */

import type { DictionaryKey } from "@/types/i18next.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { i18nLog } from "@/utils/logger.ts";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import i18next, { type TOptions } from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

let localeDirectoryData: string[] = [];
const defaultLocale = "en-US";

/**
 * Initializes i18next and loads locales.
 * @param directory The directory to search for locales in.
 */

export async function initI18Next(directory: PathLike) {
  try {
    i18nLog.info("Initializing i18next...");

    // Gets the contents of the directory.
    const directoryPath = directory.toString();
    localeDirectoryData = await getLocaleFiles(directoryPath);

    // Starts i18next.
    await i18next.use(i18NexFsBackend).init<FsBackendOptions>({
      backend: {
        loadPath: `${directoryPath}/{{lng}}/{{ns}}.json`,
      },
      defaultNS: "common",
      fallbackLng: defaultLocale,
      initAsync: true,
      interpolation: {
        skipOnVariables: false,
      },
      lng: defaultLocale,
      load: "currentOnly",
      ns: ["commands", "common", "errors"],
      preload: localeDirectoryData || [],
    });

    i18nLog.info("Successfully initialized i18next.");
  } catch (err) {
    const error = parseError(err);
    i18nLog.error(`Error initializing i18next: ${error.message}`);
    captureError(err, {
      directory: directory,
    });
  }

  return;
}

/**
 * Reads locale files from a directory.
 * @param directory The directory to search for locales in.
 * @returns An array of locale filenames.
 */

async function getLocaleFiles(directory: string) {
  try {
    // Iterates over each file.
    const files = await readdir(directory, { withFileTypes: true });
    return files.filter((file) => file.isDirectory()).map((f) => f.name);
  } catch (err) {
    const error = parseError(err);
    i18nLog.error(`Failed loading locales in ${directory}: ${error.message}`);
    captureError(err, { directory: directory });
  }

  return [];
}

/**
 * Localizes an i18next dictionary key.
 * @param key The dictionary key to localize.
 * @param options Additional i18next options.
 * @returns A localized dictionary key.
 */

export function t(key: DictionaryKey, options?: TOptions) {
  i18nLog.debug(`Localizing key ${key} to ${options?.lng || defaultLocale}.`);

  try {
    const translation = i18next.t(key, {
      // Use defaultLocale as a fallback.
      lng: defaultLocale,
      ...options,
    });

    return translation;
  } catch (err) {
    const error = parseError(err);
    i18nLog.warn(`Failed localizing key ${key}: ${error.message}`);
    captureError(error, {
      key: key,
      locale: options?.lng || defaultLocale,
    });

    return key;
  }
}

/**
 * Returns an object containing all localizations of a key.
 * @param key The key to get all localizations for.
 * @returns An object containing all localizations of a key.
 */

export function tO(key: DictionaryKey) {
  const localizations: Record<string, string> = {};

  // Iterates through each locale.
  for (const locale of localeDirectoryData) {
    try {
      // Sets the translated locale.
      const localization = t(key, { lng: locale });
      localizations[locale] = localization;
    } catch (err) {
      const error = parseError(err);
      i18nLog.warn(`No localization for ${key} in ${locale}: ${error.message}`);
      captureError(err, { key: key, locale: locale });
    }
  }

  return localizations;
}
