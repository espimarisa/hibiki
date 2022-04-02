/**
 * @file Locale types
 * @description Pulls strings from the default locale file and generates typings
 * @typedef locales
 */

import type * as en from "../locales/en-GB.json";

type HibikiLocaleStrings =
  | "NAME"
  | `fun.${keyof typeof en.fun}`
  | `general.${keyof typeof en.general}`
  | `global.${keyof typeof en.global}`
  | `image.${keyof typeof en.image}`
  // | `moderation.${keyof typeof en.moderation}`
  // | `music.${keyof typeof en.music}`
  | `owner.${keyof typeof en.owner}`
  // | `roleplay.${keyof typeof en.roleplay}`
  | `utilities.${keyof typeof en.utilities}`;

// Type for getLocaleFunction()
type getString = {
  (string: HibikiLocaleStrings, args?: Record<string, any>): string;
};
