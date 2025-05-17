/**
 * @file Chat command for member-to-member roleplay.
 * @license Zlib
 */

import type { DictionaryKey } from "@/types/i18next.d.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.ts";
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
      await interaction.reply(
        t("commands:roleplay.errorSelf", { lng: interaction.locale }),
      );

      return;
    }

    // Don't allow roleplay with the bot.
    if (interaction.client.user.id === member.id) {
      await interaction.reply(
        t("commands:roleplay.errorBot", { lng: interaction.locale }),
      );

      return;
    }

    // Gets the string and URL to use.
    switch (subcommand) {
      case "hug": {
        string = "commands:roleplay.hug.response";
        url = "https://cdn.weeb.sh/images/B10Tfknqf.gif";
        break;
      }

      case "cuddle": {
        string = "commands:roleplay.cuddle.response";
        url = "https://cdn.weeb.sh/images/rkA6SU7w-.gif";
        break;
      }

      case "kiss": {
        string = "commands:roleplay.kiss.response";
        url = "https://cdn.weeb.sh/images/SkKL3adPb.gif";
        break;
      }

      case "pat": {
        string = "commands:roleplay.pat.response";
        url = "https://cdn.weeb.sh/images/HJRIlihCZ.gif";
        break;
      }

      case "slap": {
        string = "commands:roleplay.slap.response";
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

  setData: () => {
    return {
      name: "roleplay",
      description: tD("commands:roleplay.description"),
      name_localizations: tAllN("commands:roleplay.name"),
      description_localizations: tAllD("commands:roleplay.description"),
      contexts: [InteractionContextType.Guild],
      options: [
        {
          // Cuddle subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "cuddle",
          description: tD("commands:roleplay.cuddle.description"),
          name_localizations: tAllN("commands:roleplay.cuddle.name"),
          description_localizations: tAllD(
            "commands:roleplay.cuddle.description",
          ),
          options: [
            {
              // Member option.
              type: ApplicationCommandOptionType.User,
              name: "member",
              description: tD(
                "commands:roleplay.cuddle.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.cuddle.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.cuddle.options.member.description",
              ),
            },
          ],
        },
        {
          // Hug subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "hug",
          description: tD("commands:roleplay.hug.description"),
          name_localizations: tAllN("commands:roleplay.hug.name"),
          description_localizations: tAllD("commands:roleplay.hug.description"),
          options: [
            {
              // Member option.
              type: ApplicationCommandOptionType.User,
              name: "member",
              description: tD(
                "commands:roleplay.hug.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.hug.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.hug.options.member.description",
              ),
            },
          ],
        },
        {
          // Kiss subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "kiss",
          description: tD("commands:roleplay.kiss.description"),
          name_localizations: tAllN("commands:roleplay.kiss.name"),
          description_localizations: tAllD(
            "commands:roleplay.kiss.description",
          ),
          options: [
            {
              // Member option.
              type: ApplicationCommandOptionType.User,
              name: "member",
              description: tD(
                "commands:roleplay.kiss.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.kiss.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.kiss.options.member.description",
              ),
            },
          ],
        },
        {
          // Pat subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "pat",
          description: tD("commands:roleplay.pat.description"),
          name_localizations: tAllN("commands:roleplay.pat.name"),
          description_localizations: tAllD("commands:roleplay.pat.description"),
          options: [
            {
              // Member option.
              type: ApplicationCommandOptionType.User,
              name: "member",
              description: tD(
                "commands:roleplay.pat.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.pat.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.pat.options.member.description",
              ),
            },
          ],
        },
        {
          // Slap subcommand.
          type: ApplicationCommandOptionType.Subcommand,
          name: "slap",
          description: tD("commands:roleplay.slap.description"),
          name_localizations: tAllN("commands:roleplay.slap.name"),
          description_localizations: tAllD(
            "commands:roleplay.slap.description",
          ),
          options: [
            {
              // Member option.
              type: ApplicationCommandOptionType.User,
              name: "member",
              description: tD(
                "commands:roleplay.slap.options.member.description",
              ),
              name_localizations: tAllN(
                "commands:roleplay.slap.options.member.name",
              ),
              description_localizations: tAllD(
                "commands:roleplay.slap.options.member.description",
              ),
            },
          ],
        },
      ],
    };
  },
};
