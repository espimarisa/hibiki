import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { hibikiFetch } from "$utils/fetch.ts";
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

    // Error handler
    if (!subcommand) {
      await sendErrorReply("errors:ERROR_NO_OPTION_PROVIDED", interaction);
      return;
    }

    // Gets the image relating to the type of animal
    const subcommandResponse = await this.getSubCommandResponse!(subcommand, interaction.locale);
    if (!subcommandResponse?.length) {
      await sendErrorReply("errors:ERROR_IMAGE", interaction);
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
            proxy_url: `${subcommandResponse[0]}`,
          },
          footer: {
            icon_url: interaction.client.user.displayAvatarURL(),
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
        const apiBaseURL = "https://api.thecatapi.com";
        const response = await hibikiFetch(`${apiBaseURL}/v1/images/search`);
        const body = await response?.json();

        // Error handler
        if (!(response && body?.[0]?.url)) {
          return;
        }

        // Returns data
        return [
          body[0].url,
          t("commands:COMMAND_ANIMAL_CAT", { lng: locale }),
          t("api:API_POWERED_BY", { lng: locale, url: apiBaseURL.replace("https://", "") }),
        ];
      }

      // Gets a dog picture
      case "dog": {
        const apiBaseURL = "https://dog.ceo";
        const response = await hibikiFetch(`${apiBaseURL}/api/breeds/image/random`);
        const body = await response?.json();

        // Error handler
        if (!(response && body?.message) || body?.status !== "success") {
          return;
        }

        // Returns data
        return [
          body.message,
          t("commands:COMMAND_ANIMAL_DOG", { lng: locale }),
          t("api:API_POWERED_BY", { lng: locale, url: apiBaseURL.replace("https://", "") }),
        ];
      }

      // Gets a fox picture
      case "fox": {
        const apiBaseURL = "https://randomfox.ca";
        const response = await hibikiFetch(`${apiBaseURL}/floof/`);
        const body = await response?.json();

        // Error handler
        if (!(response && body?.image)) {
          return;
        }

        // Returns data
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
