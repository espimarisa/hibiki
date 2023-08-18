// Returns a Timestamp formatted like Tuesday, 20 April 2023 16:20
export function createFullTimestamp(time: Date) {
  return `<t:${Math.floor(time.getTime() / 1000)}:F>`;
}
