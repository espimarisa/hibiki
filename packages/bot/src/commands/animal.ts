import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { hibikiFetch } from "$shared/fetch.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";

export class AnimalCommand extends HibikiCommand {
  options = [
    {
      // Cat
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      // Dog
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      // Fox
      type: ApplicationCommandOptionType.Subcommand,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the subcommand specified
    const subcommand = interaction.options.getSubcommand(true);

    if (!subcommand) {
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: t("errors:ERROR_NO_OPTION_PROVIDED", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
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
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: t("errors:ERROR_IMAGE", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
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
        const response = await hibikiFetch(`${apiBaseURL}/cat?json=true`);

        if (!response) {
          return;
        }

        const body = await response.json();

        if (!body?._id) {
          return;
        }

        // Returns the URL and strings to use
        return [
          `${apiBaseURL}/cat/${body._id}`,
          t("commands:COMMAND_ANIMAL_CAT", { lng: locale }),
          t("api:API_POWERED_BY", { lng: locale, url: apiBaseURL.replace("https://", "") }),
        ];
      }

      // Gets a dog picture
      case "dog": {
        const apiBaseURL = "https://random.dog";
        const response = await hibikiFetch(`${apiBaseURL}/woof.json`);

        if (!response) {
          return;
        }

        const body = await response.json();

        if (!body?.url) {
          return;
        }

        // Returns the URL and a string to use for the embed title
        return [
          body.url,
          t("commands:COMMAND_ANIMAL_DOG", { lng: locale }),
          t("api:API_POWERED_BY", { lng: locale, url: apiBaseURL.replace("https://", "") }),
        ];
      }

      // Gets a fox picture
      case "fox": {
        // todo type
        const apiBaseURL = "https://randomfox.ca";
        const response = await hibikiFetch(`${apiBaseURL}/floof/`);

        if (!response) {
          return;
        }

        const body = await response.json();

        if (!body?.image) {
          return;
        }

        // Returns the URL and strings to use
        return [
          body.image,
          t("commands:COMMAND_ANIMAL_FOX", { lng: locale }),
          t("api:API_POWERED_BY", { lng: locale, url: apiBaseURL.replace("https://", "") }),
        ];
      }

      default: {
        return undefined;
      }
    }
  }
}
