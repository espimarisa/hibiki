import { intervalToDuration } from "date-fns";

// Gets the amount of time that has passed since a date
export function getTimeSince(from: Date, to: Date) {
  return intervalToDuration({
    start: from,
    end: to,
  });
}
