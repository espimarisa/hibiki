/**
 * @file Commonly-used strings and helpers.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

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
