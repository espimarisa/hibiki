/**
 * @file Helpers for sending commonly-used replies.
 * @license zlib
 */

import { captureException } from "@sentry/bun";
import type { CommandInteraction, InteractionReplyOptions } from "discord.js";
import { EmbedBuilder, MessageFlags } from "discord.js";
import type { TOptions } from "i18next";
import type { DictionaryKey } from "@/types/i18next.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { t } from "@/utils/i18n.ts";
import { clientLog } from "@/utils/logger.ts";

/**
 * Sends an error reply to an interaction.
 * @param interaction The interaction to send an error reply on.
 * @param description The i18next dictionary key to use as the error message.
 * @param ephemeral If set, sends the reply to just the runner. Defaults to true.
 * @param defer If set, sends a followUp() instead of a reply. Defaults to false.
 * @param opts Additional i18next TOptions to pass to the T function.
 * @returns A promise resolving to the sent message, sent interaction data, or undefined.
 */

export async function errorReply(
  interaction: CommandInteraction,
  description: DictionaryKey,
  ephemeral = true,
  defer = false,
  opts?: TOptions,
) {
  // Sets the flags to use.
  const flags: MessageFlags | undefined = ephemeral
    ? MessageFlags.Ephemeral
    : undefined;

  // Generates the embed.
  const embed = new EmbedBuilder()
    .setTitle(t("errors:common.errorWithEmoji"))
    .setDescription(t(description, { ...opts, lng: interaction.locale }))
    .setColor(HibikiColors.Error)
    .setFooter({
      iconURL: interaction.client.user.displayAvatarURL(),
      text: t("errors:common.spottedABug", { lng: interaction.locale }),
    });

  try {
    // Generates the message structure.
    const message = {
      flags: flags,
      embeds: [embed],
    } satisfies InteractionReplyOptions;

    // Sends the reply.
    const sentMessage = defer
      ? await interaction.followUp(message)
      : await interaction.reply(message);

    return sentMessage;
  } catch (err) {
    clientLog.warn(err, "Failed to send error reply.");
    captureException(err);
  }

  return;
}
