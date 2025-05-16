/**
 * @file Chat command for member-to-member roleplay.
 * @license Zlib
 */

import type { DictionaryKey } from "@/types/i18next.d.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllDescriptions, tAllNames, tDescription } from "@/utils/i18n.ts";
import {
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

export const roleplayCommand = {
  data: buildCommandData(),

  run: async (interaction) => {
    // TODO: Stop doing this, this is a quick and dirty port.
    // Initializes the string and url to use later.
    let string: DictionaryKey;
    let url = "";

    // Gets the subcommand and member.
    const member = interaction.options.getUser("member", true);
    const subcommand = interaction.options.getSubcommand();

    // TODO: SendErrorReply; turn this into an embed.
    // Don't allow self-roleplay.
    if (interaction.user.id === member.id) {
      await interaction.reply(
        t("commands:roleplay.errorSelf", {
          lng: interaction.locale,
        }),
      );

      return;
    }

    // Don't allow roleplay with the bot.
    if (interaction.client.user.id === member.id) {
      await interaction.reply(
        t("commands:roleplay.errorBot", {
          lng: interaction.locale,
        }),
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

    // Sends the interaction.
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            t(string, {
              lng: interaction.locale,
              user: interaction.user.displayName,
              target: member.displayName,
            }),
          )
          .setColor(HibikiColors.Primary)
          .setImage(url),
      ],
    });
  },
} satisfies HibikiChatCommand;

// TODO: Make a utility for this or something, ugh. Ugly!!
function buildCommandData() {
  // Base command.
  const command = new SlashCommandBuilder()
    .setName("roleplay")
    .setNameLocalizations(tAllNames("commands:roleplay.name"))
    .setDescription(tDescription("commands:roleplay.description"))
    .setDescriptionLocalizations(
      tAllDescriptions("commands:roleplay.description"),
    )
    .setContexts(InteractionContextType.Guild);

  // Hug subcommand.
  command.addSubcommand((hug) =>
    hug
      .setName("hug")
      .setNameLocalizations(tAllNames("commands:roleplay.hug.name"))
      .setDescriptionLocalizations(
        tAllNames("commands:roleplay.hug.description"),
      )
      .addUserOption((member) =>
        member
          .setName("member")
          .setNameLocalizations(
            tAllNames("commands:roleplay.hug.options.member.name"),
          )
          .setDescription(
            tDescription("commands:roleplay.hug.options.member.description"),
          )
          .setDescriptionLocalizations(
            tAllDescriptions(
              "commands:roleplay.hug.options.member.description",
            ),
          )
          .setRequired(true),
      ),
  );

  // Cuddle subcommand.
  command.addSubcommand((cuddle) =>
    cuddle
      .setName("cuddle")
      .setNameLocalizations(tAllNames("commands:roleplay.cuddle.name"))
      .setDescriptionLocalizations(
        tAllNames("commands:roleplay.cuddle.description"),
      )
      // Member option.
      .addUserOption((member) =>
        member
          .setName("member")
          .setNameLocalizations(
            tAllNames("commands:roleplay.cuddle.options.member.name"),
          )
          .setDescription(
            tDescription("commands:roleplay.cuddle.options.member.description"),
          )
          .setDescriptionLocalizations(
            tAllDescriptions(
              "commands:roleplay.cuddle.options.member.description",
            ),
          )
          .setRequired(true),
      ),
  );

  // Kiss subcommand.
  command.addSubcommand((kiss) =>
    kiss
      .setName("kiss")
      .setNameLocalizations(tAllNames("commands:roleplay.kiss.name"))
      .setDescriptionLocalizations(
        tAllNames("commands:roleplay.kiss.description"),
      )
      // Member option.
      .addUserOption((member) =>
        member
          .setName("member")
          .setNameLocalizations(
            tAllNames("commands:roleplay.kiss.options.member.name"),
          )
          .setDescription(
            tDescription("commands:roleplay.kiss.options.member.description"),
          )
          .setDescriptionLocalizations(
            tAllDescriptions(
              "commands:roleplay.kiss.options.member.description",
            ),
          )
          .setRequired(true),
      ),
  );

  // Pat subcommand.
  command.addSubcommand((pat) =>
    pat
      .setName("pat")
      .setNameLocalizations(tAllNames("commands:roleplay.pat.name"))
      .setDescriptionLocalizations(
        tAllNames("commands:roleplay.pat.description"),
      )
      // Member option.
      .addUserOption((member) =>
        member
          .setName("member")
          .setNameLocalizations(
            tAllNames("commands:roleplay.pat.options.member.name"),
          )
          .setDescription(
            tDescription("commands:roleplay.pat.options.member.description"),
          )
          .setDescriptionLocalizations(
            tAllDescriptions(
              "commands:roleplay.pat.options.member.description",
            ),
          )
          .setRequired(true),
      ),
  );

  // Cuddle subcommand.
  command.addSubcommand((cuddle) =>
    cuddle
      .setName("cuddle")
      .setNameLocalizations(tAllNames("commands:roleplay.cuddle.name"))
      .setDescriptionLocalizations(
        tAllNames("commands:roleplay.cuddle.description"),
      )
      // Member option.
      .addUserOption((member) =>
        member
          .setName("member")
          .setNameLocalizations(
            tAllNames("commands:roleplay.cuddle.options.member.name"),
          )
          .setDescription(
            tDescription("commands:roleplay.cuddle.options.member.description"),
          )
          .setDescriptionLocalizations(
            tAllDescriptions(
              "commands:roleplay.cuddle.options.member.description",
            ),
          )
          .setRequired(true),
      ),
  );

  return command;
}
