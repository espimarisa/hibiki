/**
 * @file Utilities for localizing individual strings or modules.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/localize
 */

import { t } from "@/utils/i18n.js";
import type { Duration } from "date-fns";

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
 * Localizes and formats a time string.
 * @param time The time object to parse data from.
 * @param locale The locale to localize the object to.
 * @param disabledItems Items to remove from the complete string.
 * @returns A localized and formatted time string.
 */

export function localizeTime(
	time: Duration,
	locale: string,
	disabledItems?: LocalizedDuration,
) {
	const formattedDuration: Map<keyof LocalizedDuration, string> = new Map();

	// Number of years
	if (time.years && !disabledItems?.years) {
		formattedDuration.set(
			"years",
			t("common:YEARS", { count: time.years, lng: locale }),
		);
	}

	// Number of Months
	if (time.months && !disabledItems?.months) {
		formattedDuration.set(
			"months",
			t("common:MONTHS", { count: time.months, lng: locale }),
		);
	}

	// Number of weeks
	if (time.weeks && !disabledItems?.weeks) {
		formattedDuration.set(
			"weeks",
			t("common:WEEKS", { count: time.weeks, lng: locale }),
		);
	}

	// Number of days
	if (time.days && !disabledItems?.days) {
		formattedDuration.set(
			"days",
			t("common:DAYS", { count: time.days, lng: locale }),
		);
	}

	// Number of minutes
	if (time.minutes && !disabledItems?.minutes) {
		formattedDuration.set(
			"minutes",
			t("common:MINUTES", { count: time.minutes, lng: locale }),
		);
	}

	// Number of seconds
	if (time.seconds && !disabledItems?.seconds) {
		formattedDuration.set(
			"seconds",
			t("common:SECONDS", { count: time.seconds, lng: locale }),
		);
	}

	return [...formattedDuration.values()].join(", ");
}
