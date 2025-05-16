/**
 * @file Chat command that rolls a die.
 * @license Zlib
 */

import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllDescriptions, tAllNames, tDescription } from "@/utils/i18n.ts";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

const commandData = new SlashCommandBuilder()
  .setName("dice")
  .setNameLocalizations(tAllNames("commands:dice.name"))
  .setDescription(tDescription("commands:dice.description"))
  .setDescriptionLocalizations(tAllDescriptions("commands:dice.description"))
  // Sides option.
  .addIntegerOption((sides) =>
    sides
      .setName("sides")
      .setNameLocalizations(tAllNames("commands:dice.options.sides.name"))
      .setDescription(tDescription("commands:dice.options.sides.description"))
      .setDescriptionLocalizations(
        tAllDescriptions("commands:dice.options.sides.description"),
      )
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(120),
  );

export const coinCommand = {
  data: commandData,

  run: async (interaction) => {
    // Gets the number of sides and calculates the roll.
    const sides = interaction.options.getInteger("sides") || 6;
    const roll = Math.floor(Math.random() * sides) + 1;

    // Sends the interaction.
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            t("commands:dice.response", {
              lng: interaction.locale,
              roll: roll,
              sides: sides,
            }),
          )
          .setColor(HibikiColors.Primary),
      ],
    });
  },
} satisfies HibikiChatCommand;
