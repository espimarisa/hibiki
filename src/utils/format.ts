/**
 * @file Utilities performing formatting and normalization.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { MessageLimits } from "@/utils/constants.js";
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

/**
 * Trims a Discord message field to be under the limit.
 * @param string The string to trim.
 * @param limit The limit to set. Defaults to the description limit.
 */

export function trimMessage(
  string: string,
  limit: MessageLimits = MessageLimits.EmbedDescription,
) {
  return string.length > limit ? string.substring(0, limit) : string;
}
