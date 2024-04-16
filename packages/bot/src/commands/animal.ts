import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";

export class AnimalCommand extends HibikiCommand {
  options = [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "cat",
          description: "Sends a random picture of a cat.",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "dog",
          description: "Sends a random picture of a dog.",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "fox",
          description: "Sends a random picture of a fox.",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the subcommand specified
    const subcommand = interaction.options.getSubcommand();
    if (!subcommand) {
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR", { lng: interaction.locale, ns: "global" }),
            description: t("NO_OPTION_PROVIDED", { lng: interaction.locale, ns: "global" }),
            color: HibikiColors.ERROR,
          },
        ],
      });

      return;
    }

    // Gets the image relating to the type of animal
    const subcommandResponse = await this.getSubCommandResponse!(subcommand, interaction.locale);
    if (!subcommandResponse?.length) {
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR", { lng: interaction.locale, ns: "global" }),
            description: t("ERROR_IMAGE", { lng: interaction.locale, ns: "global" }),
            color: HibikiColors.ERROR,
          },
        ],
      });

      return;
    }

    // Sends the image
    await interaction.followUp({
      embeds: [
        {
          title: subcommandResponse[1],
          color: HibikiColors.GENERAL,
          image: {
            url: `${subcommandResponse[0]}`,
          },
          footer: {
            icon_url: this.bot.user?.displayAvatarURL(),
            text: `${subcommandResponse[2]}`,
          },
        },
      ],
    });
  }

  async getSubCommandResponse(commandName: string, locale: string): Promise<string[] | undefined> {
    switch (commandName) {
      // Gets a cat picture
      case "cat": {
        const apiBaseURL = "https://cataas.com";
        const response = await fetch(`${apiBaseURL}/cat?json=true`);

        if (!response) {
          return;
        }

        const body = await response?.json();

        if (!body?._id) {
          return;
        }

        // Returns the URL and strings to use
        return [
          `${apiBaseURL}/cat/${body._id}`,
          t("ANIMAL_CAT", { lng: locale, ns: "commands" }),
          t("API_POWERED_BY", { lng: locale, ns: "global", url: apiBaseURL.replace("https://", "") }),
        ];
      }

      // Gets a dog picture
      case "dog": {
        const apiBaseURL = "https://random.dog";
        const response = await fetch(`${apiBaseURL}/woof.json`);

        if (!response) {
          return;
        }

        const body = await response?.json();

        if (!body?.url) {
          return;
        }

        // Returns the URL and a string to use for the embed title
        return [
          body.url,
          t("ANIMAL_DOG", { lng: locale, ns: "commands" }),
          t("API_POWERED_BY", { lng: locale, ns: "global", url: apiBaseURL.replace("https://", "") }),
        ];
      }

      // Gets a fox picture
      case "fox": {
        // todo type
        const apiBaseURL = "https://randomfox.ca";
        const response = await fetch(`${apiBaseURL}/floof/`);

        if (!response) {
          return;
        }

        const body = await response?.json();

        if (!body?.image) {
          return;
        }

        // Returns the URL and strings to use
        return [
          body.image,
          t("ANIMAL_FOX", { lng: locale, ns: "commands" }),
          t("API_POWERED_BY", { lng: locale, ns: "global", url: apiBaseURL.replace("https://", "") }),
        ];
      }

      default: {
        return undefined;
      }
    }
  }
}
