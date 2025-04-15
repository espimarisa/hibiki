/**
 * @file Slash command that returns pictures of different kinds of animals.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { HibikiColors } from "@/utils/constants.js";
import { sendErrorReply } from "@/utils/error.js";
import { hFetch } from "@/utils/fetch.js";
import { t, tObj } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const animalCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("animal")
    .setNameLocalizations(tObj("commands:ANIMAL_NAME"))
    .setDescription(t("commands:ANIMAL_DESCRIPTION"))
    .setDescriptionLocalizations(tObj("commands:ANIMAL_DESCRIPTION"))
    // Cat subcommand
    .addSubcommand((cat) =>
      cat
        .setName("cat")
        .setNameLocalizations(tObj("commands:ANIMAL_CAT_NAME"))
        .setDescription(t("commands:ANIMAL_CAT_DESCRIPTION"))
        .setDescriptionLocalizations(tObj("commands:ANIMAL_CAT_DESCRIPTION")),
    )
    // Dog subcommand
    .addSubcommand((dog) =>
      dog
        .setName("dog")
        .setNameLocalizations(tObj("commands:ANIMAL_DOG_NAME"))
        .setDescription(t("commands:ANIMAL_DOG_DESCRIPTION"))
        .setDescriptionLocalizations(tObj("commands:ANIMAL_DOG_DESCRIPTION")),
    )
    // Fox subcommand
    .addSubcommand((fox) =>
      fox
        .setName("fox")
        .setNameLocalizations(tObj("commands:ANIMAL_FOX_NAME"))
        .setDescription(t("commands:ANIMAL_FOX_DESCRIPTION"))
        .setDescriptionLocalizations(tObj("commands:ANIMAL_FOX_DESCRIPTION")),
    ),
  defer: true,

  async runCommand(interaction) {
    let apiURL = "";
    let bodyKey = "";
    let titleString: DictionaryKey | "" = "";

    // Gets the subcommand to run
    const subcommand = interaction.options.getSubcommand();

    if (!subcommand) {
      await sendErrorReply(interaction, "errors:IMAGE_FAILED", true, true);
      return;
    }

    switch (subcommand) {
      // Cat: Use CatAAS; body.url for image
      case "cat": {
        apiURL = "https://cataas.com/cat?json=true";
        bodyKey = "url";
        titleString = "commands:ANIMAL_CAT_MESSAGE";
        break;
      }

      // Dog: Use random.dog; body.url for image
      case "dog": {
        apiURL = "https://random.dog/woof.json";
        bodyKey = "url";
        titleString = "commands:ANIMAL_DOG_MESSAGE";
        break;
      }

      // Fox: Use randomfox.ca; body.image for image
      case "fox": {
        apiURL = "https://randomfox.ca/floof/";
        bodyKey = "image";
        titleString = "commands:ANIMAL_FOX_MESSAGE";
        break;
      }

      default: {
        return;
      }
    }

    // Fetches the response
    const response = await hFetch(apiURL);
    if (!response) {
      await sendErrorReply(interaction, "errors:IMAGE_FAILED", true, true);
      return;
    }

    // Converts response to JSON
    const body = await response.json();
    if (!body?.[bodyKey]) {
      await sendErrorReply(interaction, "errors:IMAGE_FAILED", true, true);
      return;
    }

    // Creates the embed
    const embed = new EmbedBuilder()
      .setTitle(t(titleString))
      .setColor(HibikiColors.Primary)
      .setImage(body[bodyKey]);

    // Sends the embed
    await interaction.followUp({ embeds: [embed] });
  },
};
