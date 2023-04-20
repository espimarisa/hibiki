/**
 * @file Locale types
 * @description Pulls strings from the default locale file and generates typings
 * @typedef locales
 */

import * as defaultLocaleFile from "../locales/en-GB.json";
const en = defaultLocaleFile.default;

// Valid locale codes. This list will need to be updated manually.
type HibikiLocaleCode = "en-GB";

type HibikiLocaleStrings = `${keyof typeof en}`;

// Type for getLocaleFunction()
type getString = {
  (string: HibikiLocaleStrings, args?: Record<string, any>): string;
};
