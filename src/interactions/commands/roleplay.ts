/**
 * @file Slash command for user-to-user roleplay.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { HibikiColors } from "@/utils/constants.js";
import { sendErrorReply } from "@/utils/error.js";
import { t, tO } from "@/utils/i18n.js";
import {
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

export const roleplaycommands: HibikiChatCommandInteraction = {
  data: new SlashCommandBuilder()
    .setName("roleplay")
    .setNameLocalizations(tO("commands:ROLEPLAY_NAME"))
    .setDescription(t("commands:ROLEPLAY_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:ROLEPLAY_DESCRIPTION"))
    .setContexts(InteractionContextType.Guild)
    // Hug subcommand
    .addSubcommand((hug) =>
      hug
        .setName("hug")
        .setNameLocalizations(tO("commands:ROLEPLAY_HUG_NAME"))
        .setDescription(t("commands:ROLEPLAY_HUG_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ROLEPLAY_HUG_DESCRIPTION"))
        // MEMBER option
        .addUserOption((member) =>
          member
            .setName("member")
            .setNameLocalizations(tO("commands:ROLEPLAY_MEMBER_NAME"))
            .setDescription(t("commands:ROLEPLAY_MEMBER_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:ROLEPLAY_MEMBER_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    )
    // Cuddle subcommand
    .addSubcommand((cuddle) =>
      cuddle
        .setName("cuddle")
        .setNameLocalizations(tO("commands:ROLEPLAY_CUDDLE_NAME"))
        .setDescription(t("commands:ROLEPLAY_CUDDLE_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ROLEPLAY_CUDDLE_DESCRIPTION"))
        // MEMBER option
        .addUserOption((member) =>
          member
            .setName("member")
            .setNameLocalizations(tO("commands:ROLEPLAY_MEMBER_NAME"))
            .setDescription(t("commands:ROLEPLAY_MEMBER_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:ROLEPLAY_MEMBER_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    )
    // Kiss subcommand
    .addSubcommand((kiss) =>
      kiss
        .setName("kiss")
        .setNameLocalizations(tO("commands:ROLEPLAY_KISS_NAME"))
        .setDescription(t("commands:ROLEPLAY_KISS_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ROLEPLAY_KISS_DESCRIPTION"))
        // MEMBER option
        .addUserOption((member) =>
          member
            .setName("member")
            .setNameLocalizations(tO("commands:ROLEPLAY_MEMBER_NAME"))
            .setDescription(t("commands:ROLEPLAY_MEMBER_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:ROLEPLAY_MEMBER_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    )
    // Pat subcommand
    .addSubcommand((pat) =>
      pat
        .setName("pat")
        .setNameLocalizations(tO("commands:ROLEPLAY_PAT_NAME"))
        .setDescription(t("commands:ROLEPLAY_PAT_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ROLEPLAY_PAT_DESCRIPTION"))
        // MEMBER option
        .addUserOption((member) =>
          member
            .setName("member")
            .setNameLocalizations(tO("commands:ROLEPLAY_MEMBER_NAME"))
            .setDescription(t("commands:ROLEPLAY_MEMBER_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:ROLEPLAY_MEMBER_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    )
    // Slap subcommand
    .addSubcommand((slap) =>
      slap
        .setName("slap")
        .setNameLocalizations(tO("commands:ROLEPLAY_SLAP_NAME"))
        .setDescription(t("commands:ROLEPLAY_SLAP_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:ROLEPLAY_SLAP_DESCRIPTION"))
        // MEMBER option
        .addUserOption((member) =>
          member
            .setName("member")
            .setNameLocalizations(tO("commands:ROLEPLAY_MEMBER_NAME"))
            .setDescription(t("commands:ROLEPLAY_MEMBER_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:ROLEPLAY_MEMBER_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    ),

  async runCommand(interaction) {
    // Initialize string and url to use later
    let string: DictionaryKey;
    let url = "";

    // Gets the subcommand and member
    const member = interaction.options.getUser("member", true);
    const subcommand = interaction.options.getSubcommand();

    // Don't allow self-roleplay
    if (interaction.user.id === member.id) {
      await sendErrorReply(interaction, "commands:ROLEPLAY_SELF_MESSAGE");
      return;
    }

    // Don't allow roleplay with the bot
    if (interaction.client.user.id === member.id) {
      await sendErrorReply(interaction, "commands:ROLEPLAY_BOT_MESSAGE");
      return;
    }

    // Gets the string and URL to use
    switch (subcommand) {
      case "hug": {
        string = "commands:ROLEPLAY_HUG_MESSAGE";
        url = "https://cdn.weeb.sh/images/B10Tfknqf.gif";
        break;
      }

      case "cuddle": {
        string = "commands:ROLEPLAY_CUDDLE_MESSAGE";
        url = "https://cdn.weeb.sh/images/rkA6SU7w-.gif";
        break;
      }

      case "kiss": {
        string = "commands:ROLEPLAY_KISS_MESSAGE";
        url = "https://cdn.weeb.sh/images/SkKL3adPb.gif";
        break;
      }

      case "pat": {
        string = "commands:ROLEPLAY_PAT_MESSAGE";
        url = "https://cdn.weeb.sh/images/HJRIlihCZ.gif";
        break;
      }

      case "slap": {
        string = "commands:ROLEPLAY_SLAP_MESSAGE";
        url = "https://cdn.weeb.sh/images/HkA6mJFP-.gif";
        break;
      }

      default: {
        return;
      }
    }

    // Sends the interaction
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            t(string, {
              lng: interaction.locale,
              user: interaction.user.displayName,
              member: member.displayName,
            }),
          )
          .setColor(HibikiColors.Primary)
          .setImage(url),
      ],
    });
  },
};
