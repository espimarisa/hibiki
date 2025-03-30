/**
 * @file Utilities for formatting and organizing strings.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/format
 */

import { intervalToDuration } from "date-fns";

/**
 * Gets the amount of time that has passed since a date.
 * @param from The initial date.
 * @param to The date to calculate the initial date against.
 * @returns Formatted amount of time that has passed since a date.
 */

export function getTimeSince(from: Date, to: Date) {
	return intervalToDuration({
		start: from,
		end: to,
	});
}
