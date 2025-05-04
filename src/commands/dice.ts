/**
 * @file Slash command to roll a die of varying sides.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { HibikiCommand } from "@/helpers/command.js";
import { HibikiColors } from "@/utils/constants.js";
import { t, tO } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const diceCommand = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setNameLocalizations(tO("commands:DICE_NAME"))
    .setDescription(t("commands:DICE_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:DICE_DESCRIPTION"))
    // Sides option
    .addIntegerOption((sides) =>
      sides
        .setName("sides")
        .setNameLocalizations(tO("commands:DICE_SIDES_NAME"))
        .setDescription(t("commands:DICE_SIDES_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:DICE_SIDES_DESCRIPTION"))
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(120),
    ),

  async run(interaction) {
    // Gets the number of sides and calculates the roll
    const sides = interaction.options.getInteger("sides") || 6;
    const roll = Math.floor(Math.random() * sides) + 1;

    // Sends the interaction
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            t("commands:DICE_MESSAGE", {
              lng: interaction.locale,
              roll: roll,
              sides: sides,
            }),
          )
          .setColor(HibikiColors.Primary),
      ],
    });
  },
} satisfies HibikiCommand;
