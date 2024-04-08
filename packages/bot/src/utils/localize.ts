import { t } from "$shared/i18n.ts";
import type { Duration } from "date-fns";

interface LocalizedDuration {
  years?: string;
  months?: string;
  weeks?: string;
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
}

// Returns a formatted string (ex. 2 months, 1 day, 3 minutes, 60 seconds)
export function localizeTimeSince(time: Duration, locale: string, disabledItems?: LocalizedDuration) {
  const formattedDuration: Map<keyof LocalizedDuration, string> = new Map();

  // Number of years
  if (time.years && !disabledItems?.years) {
    formattedDuration.set("years", t("YEARS", { count: time.years, lng: locale }));
  }

  // Number of Months
  if (time.months && !disabledItems?.months) {
    formattedDuration.set("months", t("MONTHS", { count: time.months, lng: locale }));
  }

  // Number of weeks
  if (time.weeks && !disabledItems?.weeks) {
    formattedDuration.set("weeks", t("WEEKS", { count: time.weeks, lng: locale }));
  }

  // Number of days
  if (time.days && !disabledItems?.days) {
    formattedDuration.set("days", t("DAYS", { count: time.days, lng: locale }));
  }

  // Number of minutes
  if (time.minutes && !disabledItems?.minutes) {
    formattedDuration.set("minutes", t("MINUTES", { count: time.minutes, lng: locale }));
  }

  // Number of seconds
  if (time.seconds && !disabledItems?.seconds) {
    formattedDuration.set("seconds", t("SECONDS", { count: time.seconds, lng: locale }));
  }

  return [...formattedDuration.values()].join(", ");
}
