/**
 * @file Locale types
 * @description Pulls strings from the default locale file and generates typings
 * @typedef locales
 */

import type * as en from "../locales/en-GB.json";

type HibikiLocaleStrings =
  | "NAME"
  | `general.${keyof typeof en.general}`
  | `owner.${keyof typeof en.owner}`
  | `global.${keyof typeof en.global}`
  | `image.${keyof typeof en.image}`
  | `music.${keyof typeof en.music}`
  | `nsfw.${keyof typeof en.nsfw}`
  | `roleplay.${keyof typeof en.roleplay}`
  | `utilities.${keyof typeof en.utilities}`
  | `fun.${keyof typeof en.fun}`
  | `moderation.${keyof typeof en.moderation}`;

// Type for getLocaleFunction()
type getString = {
  (string: HibikiLocaleStrings, args?: Record<string, any>): string;
};
