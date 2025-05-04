/**
 * @file Utilities performing formatting and normalization.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { MessageLimits } from "@/utils/constants.js";
import { intervalToDuration } from "date-fns";

/**
 * Gets the amount of time that has passed since a date.
 * @param from The initial date to use in the calculation.
 * @param to The current date to use in the calculation.
 * @returns Formatted amount of time that has passed.
 */

export function getTimeSince(from: Date, to: Date) {
  return intervalToDuration({
    end: to,
    start: from,
  });
}

/**
 * Wrapper around substring() for easily trimming Discord content limits.
 * @param string The string to trim.
 * @param limit The limit to use.
 * @returns A trimmed string.
 */

export function trimContent(string: string, limit: MessageLimits) {
  return string.length > limit ? string.substring(0, limit) : string;
}
