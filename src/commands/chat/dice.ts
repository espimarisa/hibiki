/**
 * @file Chat command that rolls a die.
 * @license zlib
 */

import { ApplicationCommandOptionType } from "discord.js";
import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.ts";

export const coinCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Gets the number of sides and calculates the roll.
    const sides = interaction.options.getInteger("sides") || 6;
    const roll = Math.floor(Math.random() * sides) + 1;

    // Sends the reply.
    await interaction.reply({
      embeds: [
        {
          color: HibikiColors.Primary,
          title: t("commands:dice.response", {
            lng: interaction.locale,
            roll: roll,
            sides: sides,
          }),
        },
      ],
    });
  },

  data: () => {
    return {
      name: "dice",
      name_localizations: tAllN("commands:dice.name"),
      description: tD("commands:dice.description"),
      description_localizations: tAllD("commands:dice.description"),
      options: [
        {
          // Sides option.
          type: ApplicationCommandOptionType.Integer,
          name: "sides",
          name_localizations: tAllN("commands:dice.options.sides.name"),
          description: tD("commands:dice.options.sides.description"),
          description_localizations: tAllD(
            "commands:dice.options.sides.description",
          ),
          required: false,
          min_value: 1,
          max_value: 120,
        },
      ],
    };
  },
};
