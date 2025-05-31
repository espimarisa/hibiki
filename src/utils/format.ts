/**
 * @file Utilities performing formatting and normalization.
 * @license zlib
 */

import { intervalToDuration } from "date-fns";
import type { Guild, PartialUser, User } from "discord.js";
import { DiscordLimits } from "@/utils/constants.ts";

/**
 * Returns a formatted username/userID string.
 * @param user The user object to parse.
 * @returns A string formatted as username/userID.
 */

export function getUserString(user: User | PartialUser) {
  return `${user?.username || "Unknown User"}/${user?.id || "Unknown ID"}`;
}

/**
 * Returns a formatted guildName/guildID string.
 * @param guild The guild object to parse.
 * @returns A string formatted as guildName/guildID.
 */

export function getGuildString(guild: Guild) {
  return `${guild?.name || "Unknown Guild"}/${guild?.id || "Unknown ID"}`;
}

/**
 * Trims string content to fit inside of a Discord content field.
 * @param input The string to trim.
 * @param limit The Discord field limit to use.
 * @param ellipsis If set, adds an ellipsis after the trimmed content. Defaults to true.
 * @returns A trimmed string fitting inside of the specified content limit.
 */

export function trimContent(
  input: string,
  limit: keyof typeof DiscordLimits,
  ellipsis = true,
) {
  const cutoff = DiscordLimits[limit];

  // Trims the content and appends an ellipsis if set.
  if (cutoff > input.length) {
    return ellipsis
      ? `${input.substring(0, cutoff - 3)}...`
      : input.substring(0, cutoff);
  }

  // Returns the content.
  return input;
}

/**
 * Gets the amount of time that has passed since a date.
 * @param from The initial date to use in the calculation.
 * @param to The current date to use in the calculation.
 * @returns A duration object of the amount of time that has passed.
 */

export function getTimeSince(from: Date, to: Date) {
  return intervalToDuration({ end: to, start: from });
}
