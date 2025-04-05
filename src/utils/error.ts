/**
 * @file Utilities for capturing and debugging errors.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/error
 */

import { HibikiColors } from "@/utils/constants.js";
import { logger } from "@/utils/logger.js";
import {
  type CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { t } from "i18next";

const fallback = "Unknown error";

/**
 * Parses a possible error object and returns the stack.
 * @param error A possible error object to parse.
 * @returns A valid Error object or error message.
 */

export function getError(error: unknown) {
  // Return parsed error object
  if (error instanceof Error) {
    return {
      cause: error.cause ? Bun.inspect(error.cause) : (error.stack ?? fallback),
      message: error.message,
      stack: error.stack ?? fallback,
      name: error.name,
    } satisfies Error;
  }

  return {
    cause: fallback,
    message: typeof error === "string" ? error : fallback,
    stack: fallback,
    name: fallback,
  } satisfies Error;
}

/**
 * Sends an error reply to an interaction.
 * @param interaction The interaction to send the error message to.
 * @param key The key to use for the description.
 * @param opts Additional options to pass to i18next.
 */

export async function sendErrorReply(
  interaction: CommandInteraction,
  key: DictionaryKey,
  ...opts: unknown[]
) {
  // Creates the embed
  const flags = interaction.ephemeral ? MessageFlags.Ephemeral : undefined;
  const embed = new EmbedBuilder();
  embed
    .setTitle(t("error:ERROR", { lng: interaction.locale }))
    .setDescription(t(key, { ...opts, lng: interaction.locale }))
    .setColor(HibikiColors.Error)
    .setFooter({
      "iconURL": interaction.user.client.user.displayAvatarURL(),
      "text": t("error:FOUND_A_BUG", { lng: interaction.locale }),
    });

  // Sends the error message
  try {
    if (interaction.deferred) {
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
    const error = getError(err);
    logger.warn(`Failed to send error reply: ${error.message}`);
  }
}
