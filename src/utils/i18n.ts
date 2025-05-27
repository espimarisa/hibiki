/**
 * @file Utilities for working with i18next and performing i18n.
 * @license zlib
 */

import { isValidDescription, isValidName } from "@/helpers/discord.js";
import type { DictionaryKey } from "@/types/i18next.d.js";
import {
  DISCORD_LOCALE_CODES,
  MODULE_FILETYPE_REGEX,
} from "@/utils/constants.js";
import { i18NLog } from "@/utils/logger.js";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import { captureException } from "@sentry/bun";
import type { Duration } from "date-fns";
import type { Locale } from "discord.js";
import i18next, { type InitOptions, type TOptions } from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

// Type definition for a localized duration response.
type LocalizedDuration = {
  days?: string;
  hours?: string;
  minutes?: string;
  months?: string;
  seconds?: string;
  weeks?: string;
  years?: string;
};

// i18next variables.
const defaultLng = "en-US";
export const defaultNS = "common";
export const ns = ["commands", "common", "errors"] as const;

let localeDirectoryData: string[] = [];

/**
 * Initializes i18next and loads locales into memory.
 * @param directory The directory to scan for locales in.
 */

export async function initI18Next(directory: PathLike) {
  const directoryName = directory.toString();
  i18NLog.debug("Initializing i18next...");

  try {
    // Gets contents of the locales directory.
    i18NLog.debug(`Loading locales from ${directoryName}.`);
    localeDirectoryData = await getLocaleSubdirectories(directoryName);

    await i18next.use(i18NexFsBackend).init<FsBackendOptions>({
      backend: {
        loadPath: `${directoryName}/{{lng}}/{{ns}}`,
      } satisfies FsBackendOptions,
      defaultNS: defaultNS,
      fallbackLng: defaultLng,
      interpolation: {
        escapeValue: false,
      },
      load: "currentOnly",
      lng: defaultLng,
      initAsync: true,
      ns: ns,
      preload: localeDirectoryData || {},
      returnNull: false,
    } satisfies InitOptions);
  } catch (err) {
    i18NLog.error(err, "Failed to initialize i18next.");
    captureException(err);
    throw err;
  }

  i18NLog.info(`${localeDirectoryData.length} locales loaded.`);
}

/**
 * Gets locale subdirectories from the primary locales directory.
 * @param directory The directory to search for locales in.
 * @returns A promise resolving to an array of locale subdirectory names.
 */

async function getLocaleSubdirectories(directory: PathLike) {
  const directoryName = directory.toString();
  const localeDirectories: string[] = [];
  i18NLog.debug(`Reading locales from ${directoryName}.`);

  try {
    const directories = await readdir(directoryName, {
      encoding: "utf-8",
      withFileTypes: true,
    });

    for (const dir of directories) {
      // Do not attempt to load non-directories.
      const dirName = dir.name.toString();
      if (!dir.isDirectory()) {
        continue;
      }

      // Do not parse locales that Discord does not support.
      if (!DISCORD_LOCALE_CODES.includes(dirName as Locale)) {
        i18NLog.warn(`${dirName} is not supported by Discord.`);
        continue;
      }

      // Loads the directory.
      localeDirectories.push(dirName);
    }

    return localeDirectories;
  } catch (err) {
    i18NLog.error(err, `Failed reading locales from ${directoryName}.`);
    captureException(err, { extra: { directory: directoryName } });
    throw err;
  }
}

/**
 * Translates a singular i18next key (wrapper around i18n.t).
 * @param key A dictionary key to translate.
 * @param options Additional i18next TFunction options.
 * @returns A translated string in the locale set in options.lng or in the fallbackLng if unset.
 */

export function t(key: DictionaryKey, options?: TOptions) {
  // Gets the locale.
  const lng = options?.lng || defaultLng;
  i18NLog.debug(`Translating ${key} to ${lng}.`);

  try {
    // Gets the translation.
    return i18next.t(key, {
      // Explicitly set lng just to be safe.
      lng: lng,
      ...options,
    });
  } catch (err) {
    i18NLog.error(err, `Failed to translate ${key} to ${lng}.`);
    captureException(err, { extra: { key: key, lng: lng } });
  }

  // Return the key if an error was thrown just to be safe.
  return key;
}

/**
 * Translates a command/option name to the default locale.
 * @param key The dictionary key to translate.
 * @returns A translated name string in the default locale, or a placeholder string if it is invalid.
 */

export function tN(key: DictionaryKey) {
  const translation = i18next.t(key, { lng: defaultLng });

  // Checks if the translation exists and is not empty.
  if (translation === key || !translation) {
    i18NLog.error(`Name not found for ${key} in ${defaultLng}.`);
    return "nameInvalid";
  }

  // Ensures the name is valid.
  if (!isValidName(translation)) {
    i18NLog.error(`Name for ${key} is invalid.`);
    return "nameInvalid";
  }

  return translation;
}

/**
 * Localizes a command/option description to the default locale.
 * @param key The dictionary key to localize.
 * @returns A localized description string in the default locale, or an empty string if it is invalid.
 */

export function tD(key: DictionaryKey) {
  const translation = i18next.t(key, { lng: defaultLng });

  // Checks if the translation exists and is not empty.
  if (translation === key || !translation) {
    i18NLog.error(`Description not found for ${key} in ${defaultLng}.`);
    return "";
  }

  // Ensures the description is valid.
  if (!isValidDescription(translation)) {
    i18NLog.error(`Description for ${key} is invalid.`);
    return "";
  }

  return translation;
}

/**
 * Generates an object of all localizations of a command/option name.
 * @param key The dictionary key to localize.
 * @returns An object containing localizations keyed by their locale code, or an empty object.
 */

export function tAllN(key: DictionaryKey) {
  const localizations: Record<string, string> = {};

  // Iterates over possible locales.
  for (const locale of localeDirectoryData) {
    // Do not attempt to load non-json files.
    if (!MODULE_FILETYPE_REGEX.test(locale)) {
      continue;
    }

    // Do not append defaultLng to the object.
    if (locale === defaultLng) {
      continue;
    }

    // Do not parse locales that Discord does not support.
    if (!DISCORD_LOCALE_CODES.includes(locale as Locale)) {
      i18NLog.warn(`${locale} is not supported by Discord.`);
      continue;
    }

    // Skip keys that are not translated yet.
    if (!i18next.exists(key, { lng: locale })) {
      i18NLog.debug(`${key} is not translated to ${locale}, skipping.`);
      continue;
    }

    // Gets the localized translation.
    const translation = i18next.t(key, { lng: locale });
    if (isValidName(translation)) {
      localizations[locale] = translation;
    }
  }

  return localizations;
}

/**
 * Generates an object of all localizations of a command/option description.
 * @param key The dictionary key to localize.
 * @returns An object containing localizations keyed by their locale code, or an empty object.
 */

export function tAllD(key: DictionaryKey) {
  const localizations: Record<string, string> = {};

  // Iterates over possible locales.
  for (const locale of localeDirectoryData) {
    // Do not attempt to load non-json files.
    if (!MODULE_FILETYPE_REGEX.test(locale)) {
      continue;
    }

    // Do not append defaultLng to the object.
    if (locale === defaultLng) {
      continue;
    }

    // Do not parse locales that Discord does not support.
    if (!DISCORD_LOCALE_CODES.includes(locale as Locale)) {
      i18NLog.warn(`${locale} is not supported by Discord.`);
      continue;
    }

    // Skip keys that are not translated yet.
    if (!i18next.exists(key, { lng: locale })) {
      i18NLog.debug(`${key} is not translated to ${locale}, skipping.`);
      continue;
    }

    // Gets the localized translation.
    const translation = i18next.t(key, { lng: locale });
    if (isValidDescription(translation)) {
      localizations[locale] = translation;
    }
  }

  return localizations;
}

/**
 * Localizes storage amounts.
 * @param bytes The storage amount to localize.
 * @param locale The locale to use for localization.
 * @returns An object containing localized storage units.
 */

export function tBytes(bytes: number, locale: string) {
  const kb = 1024;

  // Dictionary keys with storage sizes.
  const strings = [
    "common:size.bytes",
    "common:size.kilobytes",
    "common:size.megabytes",
    "common:size.gigabytes",
    "common:size.terabytes",
  ] satisfies DictionaryKey[];

  // Calculates the digits.
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(kb)),
    strings.length - 1,
  );

  // Return the string to use.
  const value = Number.parseFloat((bytes / kb ** i).toFixed(0));
  return t(strings[i] as DictionaryKey, { lng: locale, count: value });
}

/**
 * Localizes a date-fns duration object.
 * @param time The date-fns duration object to localize.
 * @param locale The locale to use for localization.
 * @param hide An optional object of digits to ignore.
 * @returns A localized and human-readable time string.
 */

export function tTime(
  time: Duration,
  locale: string,
  hide?: LocalizedDuration,
) {
  const formattedDuration: string[] = [];

  // List of units.
  const units: (keyof LocalizedDuration)[] = [
    "days",
    "hours",
    "minutes",
    "months",
    "seconds",
    "weeks",
    "years",
  ];

  // Iterates through each unit.
  for (const unit of units) {
    // Removes disabled items.
    if (time[unit] && !hide?.[unit]) {
      // Localizes and formats.
      const key: DictionaryKey = `common:time.${unit}`;
      formattedDuration.push(t(key, { count: time[unit], lng: locale }));
    }
  }

  return formattedDuration.join(", ");
}
