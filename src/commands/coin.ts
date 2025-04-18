/**
 * @file Slash command to flip a coin.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { AllInteractionContextTypes, HibikiColors } from "@/utils/constants.js";
import { t, tO } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const coinCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("coin")
    .setNameLocalizations(tO("commands:COIN_NAME"))
    .setDescription(t("commands:COIN_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:COIN_DESCRIPTION"))
    .setContexts(AllInteractionContextTypes),

  async runCommand(interaction) {
    // Gets the face of the flipped coin and the string to use
    const face = Math.random() < 0.5 ? "heads" : "tails";
    const string: DictionaryKey =
      face === "heads"
        ? "commands:COIN_MESSAGE_HEADS"
        : "commands:COIN_MESSAGE_TAILS";

    // Sends the interaction
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t(string, { lng: interaction.locale }))
          .setColor(HibikiColors.Primary),
      ],
    });
  },
};
