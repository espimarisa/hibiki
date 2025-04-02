/**
 * @file Utilities for performing formatting and normalization.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/format
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

/**
 * Creates a Discord timestamp.
 * @param date The date object to parse.
 * @returns A full Discord timestamp.
 */

export function makeTimestamp(date: Date) {
	return `<t:${Math.floor(date.getTime() / 1000).toString()}:F>`;
}
