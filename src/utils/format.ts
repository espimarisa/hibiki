/**
 * @file Utilities for performing formatting and normalization.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/format
 */

import { type Duration, intervalToDuration } from "date-fns";
import { t } from "i18next";

type LocalizedDuration = {
  years?: string;
  months?: string;
  weeks?: string;
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
};

/**
 * Gets the amount of time that has passed since a date.
 * @param from The initial date to calculate with.
 * @param to The date to calculate passed time with.
 * @returns A formatted amount of time that has passed.
 */

export function getTimeSince(from: Date, to: Date) {
  return intervalToDuration({
    start: from,
    end: to,
  });
}

/**
 * Creates a Discord timestamp.
 * @param date The date object to parse.
 * @returns A full Discord timestamp.
 */

export function makeTimestamp(date: Date) {
  return `<t:${Math.floor(date.getTime() / 1000).toString()}:F>`;
}

/**
 * Formats and returns the proper localization string for storage units.
 * @param bytes The amount of bytes to calculate a string for.
 * @returns Localized and formatted storage units.
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
  return t(strings[i] as DictionaryKey, {
    lng: locale,
    count: Number.parseFloat((bytes / kb ** i).toFixed(0)),
  });
}

/**
 * Formats and localizes human-readable time.
 * @param time A duration object to localize.
 * @param locale The locale to use for localization.
 * @param hide An optional array of digits to hide.
 * @returns A formatted and localized human-readable time string.
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
      // Explicitly type the translation key
      const key = `common:${unit.toUpperCase()}` as DictionaryKey;

      // Localizes and formats
      formattedDuration.push(t(key, { count: time[unit], lng: locale }));
    }
  }

  return formattedDuration.join(", ");
}
