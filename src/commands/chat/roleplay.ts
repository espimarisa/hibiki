/**
 * @file Chat command for member-to-member roleplay.
 * @license zlib
 */

import {
  ApplicationCommandOptionType,
  InteractionContextType,
} from "discord.js";
import { errorReply } from "@/helpers/reply.ts";
import type { DictionaryKey } from "@/types/i18next.d.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.ts";

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
      await errorReply(
        interaction,
        "commands:roleplay.response.errorSelf",
        false,
      );
      return;
    }

    // Don't allow roleplay with the bot.
    if (interaction.client.user.id === member.id) {
      await errorReply(
        interaction,
        "commands:roleplay.response.errorBot",
        false,
      );
      return;
    }

    // Gets the string and URL to use.
    switch (subcommand) {
      case "hug": {
        string = "commands:roleplay.subcommands.hug.response";
        url = "https://cdn.weeb.sh/images/B10Tfknqf.gif";
        break;
      }

      case "cuddle": {
        string = "commands:roleplay.subcommands.cuddle.response";
        url = "https://cdn.weeb.sh/images/rkA6SU7w-.gif";
        break;
      }

      case "kiss": {
        string = "commands:roleplay.subcommands.kiss.response";
        url = "https://cdn.weeb.sh/images/SkKL3adPb.gif";
        break;
      }

      case "pat": {
        string = "commands:roleplay.subcommands.pat.response";
        url = "https://cdn.weeb.sh/images/HJRIlihCZ.gif";
        break;
      }

      case "slap": {
        string = "commands:roleplay.subcommands.slap.response";
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
      name_localizations: tAllN("commands:roleplay.name"),
      description: tD("commands:roleplay.description"),
      description_localizations: tAllD("commands:roleplay.description"),
      contexts: [InteractionContextType.Guild],
      options: [
        {
          // Cuddle subcommand.
          name: "cuddle",
          name_localizations: tAllN(
            "commands:roleplay.subcommands.cuddle.name",
          ),
          description: tD("commands:roleplay.subcommands.cuddle.description"),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.cuddle.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              description: tD(
                "commands:roleplay.subcommands.cuddle.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.subcommands.cuddle.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.cuddle.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Hug subcommand.
          name: "hug",
          name_localizations: tAllN("commands:roleplay.subcommands.hug.name"),
          description: tD("commands:roleplay.subcommands.hug.description"),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.hug.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.hug.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.hug.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.hug.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Kiss subcommand.
          name: "kiss",
          name_localizations: tAllN("commands:roleplay.subcommands.kiss.name"),
          description: tD("commands:roleplay.subcommands.kiss.description"),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.kiss.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.kiss.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.kiss.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.kiss.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Pat subcommand.
          name: "pat",
          name_localizations: tAllN("commands:roleplay.subcommands.pat.name"),
          description: tD("commands:roleplay.subcommands.pat.description"),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.pat.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.pat.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.pat.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.pat.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
        {
          // Slap subcommand.
          name: "member",
          name_localizations: tAllN("commands:roleplay.subcommands.slap.name"),
          description: tD("commands:roleplay.subcommands.slap.description"),
          description_localizations: tAllD(
            "commands:roleplay.subcommands.slap.description",
          ),
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              // Member option.
              name: "member",
              name_localizations: tAllN(
                "commands:roleplay.subcommands.slap.options.member.name",
              ),
              description: tD(
                "commands:roleplay.subcommands.slap.options.member.description",
              ),
              description_localizations: tAllD(
                "commands:roleplay.subcommands.slap.options.member.description",
              ),
              type: ApplicationCommandOptionType.User,
            },
          ],
        },
      ],
    };
  },
};
