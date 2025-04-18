/**
 * @file Slash command that returns pictures of different kinds of animals.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { AllInteractionContextTypes, HibikiColors } from "@/utils/constants.js";
import { sendErrorReply } from "@/utils/error.js";
import { hFetch } from "@/utils/fetch.js";
import { t, tO } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const animalCommand: HibikiSlashCommand = {
  defer: true,
  data: new SlashCommandBuilder()
    .setName("animal")
    .setNameLocalizations(tO("commands:ANIMAL_NAME"))
    .setDescription(t("commands:ANIMAL_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:ANIMAL_DESCRIPTION"))
    .setContexts(AllInteractionContextTypes)
    // Cat subcommand
    .addSubcommand((cat) =>
      cat
        .setName("cat")
        .setNameLocalizations(tO("commands:ANIMAL_CAT_NAME"))
        .setDescription(t("commands:ANIMAL_CAT_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ANIMAL_CAT_DESCRIPTION")),
    )
    // Dog subcommand
    .addSubcommand((dog) =>
      dog
        .setName("dog")
        .setNameLocalizations(tO("commands:ANIMAL_DOG_NAME"))
        .setDescription(t("commands:ANIMAL_DOG_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ANIMAL_DOG_DESCRIPTION")),
    )
    // Fox subcommand
    .addSubcommand((fox) =>
      fox
        .setName("fox")
        .setNameLocalizations(tO("commands:ANIMAL_FOX_NAME"))
        .setDescription(t("commands:ANIMAL_FOX_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ANIMAL_FOX_DESCRIPTION")),
    ),

  async runCommand(interaction) {
    let apiURL = "";
    let bodyKey = "";
    let titleString: DictionaryKey | "" = "";

    // Gets the subcommand to run
    const subcommand = interaction.options.getSubcommand(true);
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
    const body = await response.json();
    if (!body?.[bodyKey]) {
      await sendErrorReply(interaction, "errors:IMAGE_FAILED", true, true);
      return;
    }

    // Sends the interaction
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle(t(titleString))
          .setColor(HibikiColors.Primary)
          .setImage(body[bodyKey]),
      ],
    });
  },
};
