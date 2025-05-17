/**
 * @file Chat command that flips a coin.
 * @license Zlib
 */

import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.ts";

export const coinCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Gets the face of the flipped coin and the string to use.
    const face = Math.random() < 0.5 ? "heads" : "tails";
    const string =
      face === "heads"
        ? "commands:coin.responseHeads"
        : "commands:coin.responseTails";

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

  setData: () => {
    return {
      name: "coin",
      description: tD("commands:coin.description"),
      name_localizations: tAllN("commands:coin.name"),
      description_localizations: tAllD("commands:coin.description"),
    };
  },
};
