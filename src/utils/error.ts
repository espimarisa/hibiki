/**
 * @file Utilities to interact with and handle errors.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { HibikiColors } from "@/utils/constants.js";
import { logger } from "@/utils/logger.js";
import { type CommandInteraction, EmbedBuilder } from "discord.js";
import { t } from "i18next";

const errorFallback = "Unknown";

/**
 * Parses a possible error object and returns an Error object.
 * @param error A possible error object to parse.
 * @returns A valid Error instance.
 */

export function parseError(error: unknown) {
  // Returns the Error object if it is one
  if (error instanceof Error) {
    return error;
  }

  let message = errorFallback;

  // Handles errors that only return a string
  if (typeof error === "string") {
    message = error;
  } else if (
    // Handles non-Error objects
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    // Inspect the object and get the message
    message = Bun.inspect((error as { message: unknown }).message);
  } else {
    // Build the object
    message = Bun.inspect(error);
  }

  // Preserve the error.cause if it exists
  const cause =
    typeof error === "object" && error !== null
      ? Bun.inspect(error)
      : undefined;

  // Returns a valid Error object and appends the cause
  return new Error(message, cause ? { cause } : undefined);
}

/**
 * Sends an error reply to an interaction.
 * @param interaction The interaction to send the error message to.
 * @param key The key to use for the description.
 * @param defer If set, sends a followUp() instead of a reply().
 * @param ephemeral If set, sends the reply to just the runner.
 * @param opts Additional options to pass to i18next.
 */

export async function sendErrorReply(
  interaction: CommandInteraction,
  key: DictionaryKey,
  defer = false,
  ephemeral = false,
  opts: Record<string, unknown> = {},
) {
  // Creates the embed
  const flags = ephemeral ? "Ephemeral" : undefined;
  const embed = new EmbedBuilder();
  embed
    .setTitle(t("errors:ERROR", { lng: interaction.locale }))
    .setDescription(t(key, { ...opts, lng: interaction.locale }))
    .setColor(HibikiColors.Error)
    .setFooter({
      "iconURL": interaction.user.client.user.displayAvatarURL(),
      "text": t("errors:ERROR_BUG", { lng: interaction.locale }),
    });

  // Sends the error message
  try {
    if (defer) {
      await interaction.followUp({
        flags: flags,
        embeds: [embed],
      });
    } else {
      await interaction.reply({
        flags: flags,
        embeds: [embed],
      });
    }
  } catch (err) {
    const error = parseError(err);
    logger.warn(`Failed to send error reply: ${error.message}`);
  }
}
