/**
 * @file Commonly-used strings and helpers.
 * @license Zlib
 */

// A regex to validate Discord snowflakes with.
export const DISCORD_SNOWFLAKE_REGEX = "^(?<id>\\d{17,20})$";

// A string literal regex to validate Discord snowflakes with.
export const DISCORD_SNOWFLAKE_STRING_REGEX = "^\\d{17,20}$";

/** Commonly used durations in seconds. */
export enum Durations {
  Day = 86400,
  Hour = 3600,
  Minute = 60,
  Week = 604800,
}

/** Commonly used colors. */
export enum HibikiColors {
  Error = 0xff3000,
  Primary = 0xff0050,
  Secondary = 0xffdb26,
  Success = 0x00ffaf,
}

/** Bitfield of permissions used for generating bot invites. */
export const INVITE_PERMISSIONS = "563467534068800";

/** Discord message length limits. */
export enum MessageLimits {
  Content = 2000,
  EmbedDescription = 4096,
  EmbedFieldName = 256,
  EmbedFieldValue = 1024,
  EmbedFooterText = 2048,
  EmbedTitle = 256,
}
