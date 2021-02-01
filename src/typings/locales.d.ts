/**
 * @file Locale types
 * @description Pulls strings from the default locale file and generates typings
 * @typedef locales
 * @author resolved <resolvedxd@gmail.com> // god bless
 */

import type * as en from "../locales/en.json";

// Valid JSON items
export type LocaleStrings =
  | "EMOJI"
  | "NAME"
  | `fun.${keyof typeof en.fun}`
  | `general.${keyof typeof en.general}`
  | `global.${keyof typeof en.global}`
  | `image.${keyof typeof en.image}`
  | `logger.${keyof typeof en.logger}`
  | `moderation.${keyof typeof en.moderation}`
  | `music.${keyof typeof en.music}`
  | `nsfw.${keyof typeof en.nsfw}`
  | `owner.${keyof typeof en.owner}`
  | `roleplay.${keyof typeof en.roleplay}`
  | `utility.${keyof typeof en.utility}`;

// Gets a string
export interface LocaleString {
  (string: LocaleStrings, args?: Record<string, unknown> | undefined): string;
}
