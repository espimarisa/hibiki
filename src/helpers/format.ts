/**
 * @file Formats specific items or structures.
 * @license zlib
 */

import { intervalToDuration } from "date-fns";

/**
 * Gets the amount of time that has passed since a date.
 * @param from The initial date to use in the calculation.
 * @param to The current date to use in the calculation.
 * @returns A duration object of the amount of time that has passed.
 */

export function getTimeSince(from: Date, to: Date) {
  return intervalToDuration({ end: to, start: from });
}
