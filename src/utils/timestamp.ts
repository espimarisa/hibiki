// Creates a Discord timestamp
export function createFullTimestamp(time: Date) {
  return `<t:${Math.floor(time.getTime() / 1000).toString()}:F>`;
}
