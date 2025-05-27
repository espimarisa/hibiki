/**
 * @file Chat command for member-to-member roleplay.
 * @license zlib
 */

import { errorReply } from "@/helpers/reply.js";
import type { DictionaryKey } from "@/types/i18next.d.js";
import { HibikiColors } from "@/utils/constants.js";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.js";
import {
  ApplicationCommandOptionType,
  InteractionContextType,
} from "discord.js";

export const roleplayCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Initializes the string and url to use later.
    let string: DictionaryKey;
    let url = "";

    // Gets the subcommand and member.
    const member = interaction.options.getUser("member", true);
    const subcommand = interaction.options.getSubcommand();

    // Don't allow self-roleplay.
    if (interaction.user.id === member.id) {
      await errorReply(interaction, "commands:roleplay.errors.self", false);
      return;
    }

    // Don't allow roleplay with the bot.
    if (interaction.client.user.id === member.id) {
      await errorReply(interaction, "commands:roleplay.errors.bot", false);
      return;
    }

    // Gets the string and URL to use.
    switch (subcommand) {
      case "hug": {
        string = "commands:roleplay.subcommands.hug.response.message";
        url = "https://cdn.weeb.sh/images/B10Tfknqf.gif";
        break;
      }

      case "cuddle": {
        string = "commands:roleplay.subcommands.cuddle.response.message";
        url = "https://cdn.weeb.sh/images/rkA6SU7w-.gif";
        break;
      }

      case "kiss": {
        string = "commands:roleplay.subcommands.kiss.response.message";
        url = "https://cdn.weeb.sh/images/SkKL3adPb.gif";
        break;
      }

      case "pat": {
        string = "commands:roleplay.subcommands.pat.response.message";
        url = "https://cdn.weeb.sh/images/HJRIlihCZ.gif";
        break;
      }

      case "slap": {
        string = "commands:roleplay.subcommands.slap.response.message";
        url = "https://cdn.weeb.sh/images/HkA6mJFP-.gif";
        break;
      }

      default: {
        return;
      }
    }

    // Sends the reply.
    await interaction.reply({
      embeds: [
        {
          color: HibikiColors.Primary,
          title: t(string, {
            lng: interaction.locale,
            user: interaction.user.displayName,
            target: member.displayName,
          }),
          image: {
            url: url,
          },
        },
      ],
    });
  },

  data: () => {
    return {
      name: "roleplay",
      name_localizations: tAllN("commands:roleplay._data.name"),
      description: tD("commands:roleplay._data.description"),
      description_localizations: tAllD("commands:roleplay._data.description"),
      contexts: [InteractionContextType.Guild],
      options: [
        {
          // Cuddle subcommand.
          name: "cuddle",
          name_localizations: tAllN(
            "commands:roleplay.subcommands.cuddle._data.name",
          ),
          description: tD(
            "commands:roleplay.subcommands.cuddle._data.description",
          ),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.cuddle._data.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              description: tD(
                "commands:roleplay.subcommands.cuddle._data.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.subcommands.cuddle._data.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.cuddle._data.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Hug subcommand.
          name: "hug",
          name_localizations: tAllN(
            "commands:roleplay.subcommands.hug._data.name",
          ),
          description: tD(
            "commands:roleplay.subcommands.hug._data.description",
          ),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.hug._data.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.hug._data.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.hug._data.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.hug._data.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Kiss subcommand.
          name: "kiss",
          name_localizations: tAllN(
            "commands:roleplay.subcommands.kiss._data.name",
          ),
          description: tD(
            "commands:roleplay.subcommands.kiss._data.description",
          ),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.kiss._data.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.kiss._data.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.kiss._data.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.kiss._data.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Pat subcommand.
          name: "pat",
          name_localizations: tAllN(
            "commands:roleplay.subcommands.pat._data.name",
          ),
          description: tD(
            "commands:roleplay.subcommands.pat._data.description",
          ),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.pat._data.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.pat._data.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.pat._data.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.pat._data.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Slap subcommand.
          name: "member",
          name_localizations: tAllN(
            "commands:roleplay.subcommands.slap._data.name",
          ),
          description: tD(
            "commands:roleplay.subcommands.slap._data.description",
          ),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.slap._data.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.slap._data.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.slap._data.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.slap._data.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
      ],
    };
  },
};
