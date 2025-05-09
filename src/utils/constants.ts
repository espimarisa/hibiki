/**
 * @file Commonly-used strings and variables.
 * @license Zlib
 */

// A regex to validate Discord snowflakes with.
export const DISCORD_SNOWFLAKE_REGEX = "^(?<id>\\d{17,20})$";

// Bitfield of permissions used for generating bot invites.
export const INVITE_PERMISSIONS = "563467534068800";

// Commonly used hexadecimal colors.
export enum HibikiColors {
  Error = 0xff3000,
  Primary = 0xff0050,
  Secondary = 0xffdb26,
  Starboard = 0xffac33,
  Success = 0x00ffaf,
}

// Common Discord content length limits.
export enum MessageLimits {
  Content = 2000,
  EmbedDescription = 4096,
  EmbedFieldName = 256,
  EmbedFieldValue = 1024,
  EmbedFooterText = 2048,
  EmbedTitle = 256,
}
