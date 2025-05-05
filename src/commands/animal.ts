/**
 * @file Slash command that returns pictures of different kinds of animals.
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import type { DictionaryKey } from "@/types/i18next.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { sendErrorReply } from "@/utils/error.ts";
import { hFetch } from "@/utils/fetch.ts";
import { t, tO } from "@/utils/i18n.ts";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const animalCommand = {
  data: new SlashCommandBuilder()
    .setName("animal")
    .setNameLocalizations(tO("commands:ANIMAL_NAME"))
    .setDescription(t("commands:ANIMAL_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:ANIMAL_DESCRIPTION"))
    // Cat subcommand.
    .addSubcommand((cat) =>
      cat
        .setName("cat")
        .setNameLocalizations(tO("commands:ANIMAL_CAT_NAME"))
        .setDescription(t("commands:ANIMAL_CAT_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ANIMAL_CAT_DESCRIPTION")),
    )
    // Dog subcommand.
    .addSubcommand((dog) =>
      dog
        .setName("dog")
        .setNameLocalizations(tO("commands:ANIMAL_DOG_NAME"))
        .setDescription(t("commands:ANIMAL_DOG_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ANIMAL_DOG_DESCRIPTION")),
    )
    // Fox subcommand.
    .addSubcommand((fox) =>
      fox
        .setName("fox")
        .setNameLocalizations(tO("commands:ANIMAL_FOX_NAME"))
        .setDescription(t("commands:ANIMAL_FOX_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ANIMAL_FOX_DESCRIPTION")),
    ),

  async run(interaction) {
    let apiURL = "";
    let bodyKey = "";
    let titleString: DictionaryKey | "" = "";

    // Gets the subcommand to run.
    const subcommand = interaction.options.getSubcommand(true);

    switch (subcommand) {
      // Cat: Use CatAAS; body.url for image.
      case "cat": {
        apiURL = "https://cataas.com/cat?json=true";
        bodyKey = "url";
        titleString = "commands:ANIMAL_CAT_MESSAGE";
        break;
      }

      // Dog: Use random.dog; body.url for image.
      case "dog": {
        apiURL = "https://random.dog/woof.json";
        bodyKey = "url";
        titleString = "commands:ANIMAL_DOG_MESSAGE";
        break;
      }

      // Fox: Use randomfox.ca; body.image for image.
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

    // Fetches the response.
    const response = await hFetch(apiURL);
    if (!response) {
      await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
      return;
    }

    // Converts the response to JSON.
    const body = await response.json();
    if (!body?.[bodyKey]) {
      await sendErrorReply(interaction, "errors:IMAGE_FAILED", true, true);
      return;
    }

    // Sends the interaction.
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t(titleString))
          .setColor(HibikiColors.Primary)
          .setImage(body[bodyKey]),
      ],
    });
  },
} satisfies HibikiCommand;
