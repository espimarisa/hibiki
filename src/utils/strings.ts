export const clean = (text: string): string => {
  return typeof text === "string"
    ? text.replace(/`/g, "`" + String.fromCodePoint(8203)).replace(/@/g, "@" + String.fromCodePoint(8203))
    : text;
};
