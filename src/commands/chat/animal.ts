/**
 * @file Chat command to get pictures of different types of animals.
 * @license zlib
 */

import { errorReply } from "@/helpers/reply.js";
import { HibikiColors } from "@/utils/constants.js";
import { hFetch } from "@/utils/fetch.js";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.js";
import { ApplicationCommandOptionType } from "discord.js";

export const animalCommand: HibikiChatCommand = {
  run: async (interaction) => {
    let api = "";
    let key = "";
    let string: DictionaryKey | "" = "";

    // Gets the subcommand to run.
    const subcommand = interaction.options.getSubcommand(true);

    switch (subcommand) {
      // Cat: Use CatAAS; body.url for image.
      case "cat": {
        api = "https://cataas.com/cat?json=true";
        key = "url";
        string = "commands:animal.cat.response";
        break;
      }

      // Dog: Use random.dog; body.url for image.
      case "dog": {
        api = "https://random.dog/woof.json";
        key = "url";
        string = "commands:animal.dog.response";
        break;
      }

      default: {
        return;
      }
    }

    // Fetches the response.
    const response = await hFetch(api);
    if (!response) {
      await errorReply(interaction, "errors:fetch.fetch");
      return;
    }

    // Converts the response to JSON.
    const body = await response.json();
    if (!body?.[key]) {
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
            url: body[key],
          },
        },
      ],
    });
  },

  data: () => {
    return {
      name: t("commands:animal.name"),
      description: tD("commands:animal.description"),
      name_localizations: tAllN("commands:animal.name"),
      description_localizations: tAllD("commands:animal.description"),
      options: [
        {
          // Cat subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "cat",
          description: t("commands:animal.cat.description"),
          name_localizations: tAllN("commands:animal.cat.name"),
          description_localizations: tAllD("commands:animal.cat.description"),
        },
        {
          // Dog subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "dog",
          description: t("commands:animal.dog.description"),
          name_localizations: tAllN("commands:animal.dog.name"),
          description_localizations: tAllD("commands:animal.dog.description"),
        },
      ],
    };
  },
};
