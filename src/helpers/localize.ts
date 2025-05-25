/**
 * @file Localizes specific items or structures.
 * @license Zlib
 */

import type { DictionaryKey } from "@/types/i18next.ts";
import { t } from "@/utils/i18n.js";
import type { Duration } from "date-fns";

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

/**
 * Localizes storage amounts.
 * @param bytes The storage amount to localize.
 * @param locale The locale to use for localization.
 * @returns An object containing localized storage units.
 */

export function localizeBytes(bytes: number, locale: string) {
  const kb = 1024;

  // Dictionary keys with storage sizes.
  const strings = [
    "common:sizes.bytes",
    "common:sizes.kilobytes",
    "common:sizes.megabytes",
    "common:sizes.gigabytes",
    "common:sizes.terabytes",
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

export function localizeTime(
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
