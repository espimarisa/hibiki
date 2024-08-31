import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";

export class RoleplayCommand extends HibikiCommand {
  options = [
    {
      // Hug
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "nl-member",
          description: "NON-LOCALIZED: The member to hug.",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      // Pat
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "nl-member",
          description: "NON-LOCALIZED: The member to headpat.",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      // Cuddle
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "nl-member",
          description: "NON-LOCALIZED: The member to cuddle.",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      // Kiss
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "nl-member",
          description: "NON-LOCALIZED: The member to kiss.",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the subcommand specified
    const subcommand = interaction.options.getSubcommand(true);
    const member = await interaction.options.getUser(this.options[0]!.options[0]!.name)?.fetch();

    // Error handler
    if (!(subcommand && member)) {
      await sendErrorReply("errors:ERROR_NO_OPTION_PROVIDED", interaction);
      return;
    }

    // Disallow roleplay with yourself
    if (interaction.user.id === member.id) {
      await sendErrorReply("commands:COMMAND_ROLEPLAY_SELF", interaction);
      return;
    }

    // Gets the individual roleplay response
    const subCommandResponse: string[] | undefined = this.getSubCommandResponse(
      subcommand,
      interaction.locale,
      interaction.user.globalName ? interaction.user.globalName : interaction.user.tag,
      member.globalName ? member.globalName : member.tag,
    );

    // Error handler for no option
    if (!subCommandResponse) {
      await sendErrorReply("errors:ERROR_NO_OPTION_PROVIDED", interaction);
      return;
    }

    // Sends the roleplay response
    await interaction.followUp({
      embeds: [
        {
          title: subCommandResponse[1],
          color: HibikiColors.GENERAL,
          image: {
            url: `${subCommandResponse[0]}`,
          },
          footer: {
            text: t("api:API_POWERED_BY", { locale: interaction.locale, url: "weeb.sh" }),
            icon_url: interaction.client.user.displayAvatarURL(),
          },
        },
      ],
    });
  }

  getSubCommandResponse(commandName: string, locale: string, user: string, target: string): string[] | undefined {
    switch (commandName) {
      // Hug
      case "hug": {
        return [
          "https://cdn.weeb.sh/images/B10Tfknqf.gif",
          t("commands:COMMAND_ROLEPLAY_HUG", { lng: locale, user: user, target: target }),
        ];
      }

      // Pat
      case "pat": {
        return [
          "https://cdn.weeb.sh/images/HJRIlihCZ.gif",
          t("commands:COMMAND_ROLEPLAY_PAT", { lng: locale, user: user, target: target }),
        ];
      }

      // Cuddle
      case "cuddle": {
        return [
          "https://cdn.weeb.sh/images/rkA6SU7w-.gif",
          t("commands:COMMAND_ROLEPLAY_CUDDLE", { lng: locale, user: user, target: target }),
        ];
      }

      // Kiss
      case "kiss": {
        return [
          "https://cdn.weeb.sh/images/SkKL3adPb.gif",
          t("commands:COMMAND_ROLEPLAY_KISS", { lng: locale, user: user, target: target }),
        ];
      }

      default: {
        return undefined;
      }
    }
  }
}
