import * as defaultLocaleFile from "../locales/en-GB.json";
const en = defaultLocaleFile.default;

// Valid locale codes. This list will need to be updated manually to match ../locales
type HibikiLocaleCode = "en-GB";

// Valid dictionary strings
type HibikiDictionaryStrings = `${keyof typeof en}`;

// Type for getLocaleFunction()
type getString = {
  (string: HibikiDictionaryStrings, args?: Record<string, any>): string;
};
