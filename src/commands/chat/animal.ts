/**
 * @file Chat command to get pictures of different types of animals.
 * @license zlib
 */

import { ApplicationCommandOptionType } from "discord.js";
import { errorReply } from "@/helpers/reply.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { hFetch } from "@/utils/fetch.ts";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.ts";

// Typing for a possible Animal API response.
type AnimalApiResponse = {
  url?: string;
  [key: string]: string;
};

export const animalCommand: HibikiChatCommand = {
  run: async (interaction) => {
    let apiURL = "";
    let bodyKey = "";
    let string: DictionaryKey | "" = "";

    // Gets the subcommand to run.
    const subcommand = interaction.options.getSubcommand(true);

    switch (subcommand) {
      // Cat: Use CatAAS; body.url for image.
      case "cat": {
        apiURL = "https://cataas.com/cat?json=true";
        bodyKey = "url";
        string = "commands:animal.subcommands.cat.response";
        break;
      }

      // Dog: Use random.dog; body.url for image.
      case "dog": {
        apiURL = "https://random.dog/woof.json";
        bodyKey = "url";
        string = "commands:animal.subcommands.dog.response";
        break;
      }

      default: {
        return;
      }
    }

    // Fetches the response.
    const response = await hFetch(apiURL);
    if (!response) {
      await errorReply(interaction, "errors:fetch.failed");
      return;
    }

    // Converts the response to JSON.
    const body = (await response.json()) as AnimalApiResponse;
    const imageUrl = body[bodyKey];
    if (!imageUrl) {
      await errorReply(interaction, "errors:fetch.image");
      return;
    }

    // Sends the interaction.
    await interaction.reply({
      embeds: [
        {
          title: t(string, { lng: interaction.locale }),
          color: HibikiColors.Primary,
          image: {
            url: imageUrl,
          },
        },
      ],
    });
  },

  data: () => {
    return {
      name: "animal",
      name_localizations: tAllN("commands:animal.name"),
      description: tD("commands:animal.description"),
      description_localizations: tAllD("commands:animal.description"),
      options: [
        {
          // Cat subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "cat",
          name_localizations: tAllN("commands:animal.subcommands.cat.name"),
          description: t("commands:animal.subcommands.cat.description"),
          description_localizations: tAllD(
            "commands:animal.subcommands.cat.description",
          ),
        },
        {
          // Dog subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "dog",
          name_localizations: tAllN("commands:animal.subcommands.dog.name"),
          description: t("commands:animal.subcommands.dog.description"),
          description_localizations: tAllD(
            "commands:animal.subcommands.dog.description",
          ),
        },
      ],
    };
  },
};
