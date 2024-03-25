import { intervalToDuration } from "date-fns";

// Gets time since a date
export function getTimeSince(from: Date, to: Date) {
  return intervalToDuration({
    start: from,
    end: to,
  });
}
