/**
 * @file Chat command that flips a coin.
 * @license Zlib
 */

import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllDescriptions, tAllNames, tDescription } from "@/utils/i18n.ts";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

const commandData = new SlashCommandBuilder()
  .setName("coin")
  .setNameLocalizations(tAllNames("commands:coin.name"))
  .setDescription(tDescription("commands:coin.description"))
  .setDescriptionLocalizations(tAllDescriptions("commands:coin.description"));

export const coinCommand = {
  data: commandData,

  run: async (interaction) => {
    // Gets the face of the flipped coin and the string to use.
    const face = Math.random() < 0.5 ? "heads" : "tails";
    const string =
      face === "heads"
        ? "commands:coin.responseHeads"
        : "commands:coin.responseTails";

    // Sends the interaction.
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t(string, { lng: interaction.locale }))
          .setColor(HibikiColors.Primary),
      ],
    });
  },
} satisfies HibikiChatCommand;
