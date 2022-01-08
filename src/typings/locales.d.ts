/**
 * @file Locale types
 * @description Pulls strings from the default locale file and generates typings
 * @typedef locales
 */

import type * as en from "../locales/en-GB.json";

type HibikiLocaleStrings = "NAME" | `general.${keyof typeof en.general}` | `global.${keyof typeof en.global}`;

// Type for getLocaleFunction()
type getString = {
  (string: HibikiLocaleStrings, args?: Record<string, any>): string;
};
