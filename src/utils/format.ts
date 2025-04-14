/**
 * @file Utilities performing formatting and normalization.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { intervalToDuration } from "date-fns";

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
