/**
 * @file Chat command that flips a coin.
 * @license zlib
 */

import { HibikiColors } from "@/utils/constants.js";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.js";

export const coinCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Gets the face of the flipped coin and the string to use.
    const face = Math.random() < 0.5 ? "heads" : "tails";
    const string =
      face === "heads"
        ? "commands:coin.response.heads"
        : "commands:coin.response.tails";

    // Sends the reply.
    await interaction.reply({
      embeds: [
        {
          color: HibikiColors.Primary,
          title: t(string, { lng: interaction.locale }),
        },
      ],
    });
  },

  data: () => {
    return {
      name: "coin",
      name_localizations: tAllN("commands:coin._data.name"),
      description: tD("commands:coin._data.description"),
      description_localizations: tAllD("commands:coin._data.description"),
    };
  },
};
