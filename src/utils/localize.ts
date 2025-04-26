/**
 * @file Utilities for localizing structures.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { t } from "@utils/i18n.js";
import type { Duration } from "date-fns";

/**
 * Localizes storage amounts.
 * @param bytes The storage amount to localize.
 * @param locale The locale to use for localization.
 * @returns An object containing localized storage units.
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
 * Localizes time.
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
