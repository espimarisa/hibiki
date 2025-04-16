/**
 * @file Utilities for working with the localization system.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { captureError, parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import type { Duration } from "date-fns";
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
    logger.info("Initializing i18next...");

    // Gets the contents of the directory
    const directoryPath = directory.toString();
    localeDirectoryData = await getLocaleFiles(directoryPath);

    // Starts i18next
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
      preload: localeDirectoryData || [],
      lng: defaultLocale,
      load: "currentOnly",
      ns: ["commands", "common", "errors"],
    });

    logger.info("Successfully initialized i18next");
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error initializing i18next: ${error.message}`);

    // Captures the error with Sentry
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
    // Iterates over each file
    const files = await readdir(directory, { withFileTypes: true });
    return files.filter((file) => file.isDirectory()).map((f) => f.name);
  } catch (err) {
    const error = parseError(err);
    logger.error(`Failed to load locales from ${directory}: ${error.message}`);

    // Captures the error with Sentry
    captureError(err, {
      directory: directory,
    });
  }

  return [];
}

/**
 * Returns an object containing all localizations of a key.
 * @param key The key to get all localizations for.
 * @returns An object containing all localizations of a key.
 */

export function tO(key: DictionaryKey) {
  const localizations: Record<string, string> = {};

  // Iterates through each locale
  for (const locale of localeDirectoryData) {
    try {
      // Sets the translated locale
      const translation = t(key, { lng: locale });
      localizations[locale] = translation;
    } catch (err) {
      const error = parseError(err);
      logger.warn(`No translation for ${key} in ${locale}: ${error.message}`);

      // Captures the error with Sentry
      captureError(err, {
        key: key,
        locale: locale,
      });
    }
  }

  return localizations;
}

/**
 * Localizes an i18next dictionary key.
 * @param key The dictionary key to localize.
 * @param options Additional i18next options.
 * @returns A localized dictionary key.
 */

export function t(key: DictionaryKey, options?: TOptions) {
  try {
    const translation = i18next.t(key, {
      // Use defaultLocale as a fallback
      // NOTE: i18next *has* fallback support, but it is quirky
      // This wrapper allows us to perform future arguments more easily anyways
      lng: defaultLocale,
      ...options,
    });

    return translation;
  } catch (err) {
    const error = parseError(err);

    // Captures the error with Sentry
    captureError(err, {
      key: key,
      locale: options?.lng || defaultLocale,
    });

    return key;
  }
}

/**
 * Formats and localizes storage amounts.
 * @param bytes The amount to calculate a string for.
 * @param locale The locale to use for localization.
 * @returns An object containing localized storage unit strings.
 */

export function localizeBytes(bytes: number, locale: string) {
  const kb = 1024;

  // Dictionary keys with storage sizes
  const strings = [
    "common:BYTES",
    "common:BYTES_KB",
    "common:BYTES_MB",
    "common:BYTES_GB",
    "common:BYTES_TB",
  ] satisfies DictionaryKey[];

  // Calculates the digits
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(kb)),
    strings.length - 1,
  );

  // Return string to use
  const value = Number.parseFloat((bytes / kb ** i).toFixed(0));
  return t(strings[i] as DictionaryKey, { lng: locale, count: value });
}

/**
 * Formats and localizes human-readable time.
 * @param time The date-fns duration object to localize.
 * @param locale The locale to use for localization.
 * @param hide An optional object of digits to ignore.
 * @returns A localized and human-readable time string.
 */

export function localizeTime(
  time: Duration,
  locale: string,
  hide?: LocalizedDuration,
) {
  const formattedDuration: string[] = [];

  // List of units
  const units: (keyof LocalizedDuration)[] = [
    "years",
    "months",
    "weeks",
    "days",
    "hours",
    "minutes",
    "seconds",
  ];

  // Iterates through each unit
  for (const unit of units) {
    // Removes disabled items
    if (time[unit] && !hide?.[unit]) {
      // Gets the key to use
      const key = `common:${unit.toUpperCase()}` as DictionaryKey;

      // Localizes and formats
      formattedDuration.push(t(key, { count: time[unit], lng: locale }));
    }
  }

  return formattedDuration.join(", ");
}

// Type definition for a localized duration response
type LocalizedDuration = {
  years?: string;
  months?: string;
  weeks?: string;
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
};
