/**
 * @file Chat command that rolls a die.
 * @license zlib
 */

import { HibikiColors } from "@/utils/constants.js";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.js";
import { ApplicationCommandOptionType } from "discord.js";

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
          title: t("commands:dice.response.result", {
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
      name_localizations: tAllN("commands:dice._data.name"),
      description: tD("commands:dice._data.description"),
      description_localizations: tAllD("commands:dice._data.description"),
      options: [
        {
          // Sides option.
          type: ApplicationCommandOptionType.Integer,
          name: "sides",
          name_localizations: tAllN("commands:dice._data.options.sides.name"),
          description: tD("commands:dice._data.options.sides.description"),
          description_localizations: tAllD(
            "commands:dice._data.options.sides.description",
          ),
          required: false,
          min_value: 1,
          max_value: 120,
        },
      ],
    };
  },
};
