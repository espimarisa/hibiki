/**
 * @file Slash command for user-to-user roleplay.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/slash/roleplay
 */

import { HibikiColors } from "@/utils/constants.js";
import { t, tMap } from "@/utils/i18n.js";
import {
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

export const roleplayCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("roleplay")
    .setNameLocalizations(tMap("command:ROLEPLAY_NAME"))
    .setDescription(t("command:ROLEPLAY_DESCRIPTION"))
    .setDescriptionLocalizations(tMap("command:ROLEPLAY_DESCRIPTION"))
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((hug) =>
      hug
        .setName("hug")
        .setNameLocalizations(tMap("command:ROLEPLAY_HUG_NAME"))
        .setDescription(t("command:ROLEPLAY_HUG_DESCRIPTION"))
        .setDescriptionLocalizations(tMap("command:ROLEPLAY_HUG_DESCRIPTION"))
        .addUserOption((target) =>
          target
            .setName("target")
            .setNameLocalizations(tMap("command:ROLEPLAY_TARGET_NAME"))
            .setDescription(t("command:ROLEPLAY_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tMap("command:ROLEPLAY_TARGET_DESCRIPTION"),
            ),
        ),
    )
    .addSubcommand((cuddle) =>
      cuddle
        .setName("cuddle")
        .setNameLocalizations(tMap("command:ROLEPLAY_CUDDLE_NAME"))
        .setDescription(t("command:ROLEPLAY_CUDDLE_DESCRIPTION"))
        .setDescriptionLocalizations(
          tMap("command:ROLEPLAY_CUDDLE_DESCRIPTION"),
        )
        .addUserOption((target) =>
          target
            .setName("target")
            .setNameLocalizations(tMap("command:ROLEPLAY_TARGET_NAME"))
            .setDescription(t("command:ROLEPLAY_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tMap("command:ROLEPLAY_TARGET_DESCRIPTION"),
            ),
        ),
    )
    .addSubcommand((kiss) =>
      kiss
        .setName("kiss")
        .setNameLocalizations(tMap("command:ROLEPLAY_KISS_NAME"))
        .setDescription(t("command:ROLEPLAY_KISS_DESCRIPTION"))
        .setDescriptionLocalizations(tMap("command:ROLEPLAY_KISS_DESCRIPTION"))
        .addUserOption((target) =>
          target
            .setName("target")
            .setNameLocalizations(tMap("command:ROLEPLAY_TARGET_NAME"))
            .setDescription(t("command:ROLEPLAY_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tMap("command:ROLEPLAY_TARGET_DESCRIPTION"),
            ),
        ),
    )
    .addSubcommand((pat) =>
      pat
        .setName("pat")
        .setNameLocalizations(tMap("command:ROLEPLAY_PAT_NAME"))
        .setDescription(t("command:ROLEPLAY_PAT_DESCRIPTION"))
        .setDescriptionLocalizations(tMap("command:ROLEPLAY_PAT_DESCRIPTION"))
        .addUserOption((target) =>
          target
            .setName("target")
            .setNameLocalizations(tMap("command:ROLEPLAY_TARGET_NAME"))
            .setDescription(t("command:ROLEPLAY_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tMap("command:ROLEPLAY_TARGET_DESCRIPTION"),
            ),
        ),
    )
    .addSubcommand((slap) =>
      slap
        .setName("slap")
        .setNameLocalizations(tMap("command:ROLEPLAY_SLAP_NAME"))
        .setDescription(t("command:ROLEPLAY_SLAP_DESCRIPTION"))
        .setDescriptionLocalizations(tMap("command:ROLEPLAY_SLAP_DESCRIPTION"))
        .addUserOption((target) =>
          target
            .setName("target")
            .setNameLocalizations(tMap("command:ROLEPLAY_TARGET_NAME"))
            .setDescription(t("command:ROLEPLAY_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tMap("command:ROLEPLAY_TARGET_DESCRIPTION"),
            ),
        ),
    ),

  async runCommand(interaction) {
    // Initialize string and url to use later
    let string: DictionaryKey;
    let url = "";

    // Gets the subcommand and target
    const embed = new EmbedBuilder();
    const target = interaction.options.getUser("target");
    const subcommand = interaction.options.getSubcommand();

    // Handles unresolved data
    if (!(target && subcommand)) {
      await interaction.reply({
        flags: "Ephemeral",
        embeds: [
          embed
            .setTitle(t("error:ERROR"))
            .setDescription(t("error:NO_OPTION"))
            .setColor(HibikiColors.Error)
            .setFooter({ "text": t("error:FOUND_A_BUG") }),
        ],
      });

      return;
    }

    // Don't allow self-roleplay
    if (interaction.user.id === target.id) {
      await interaction.reply({
        embeds: [
          embed
            .setTitle(t("error:ERROR"))
            .setDescription(t("command:ROLEPLAY_SELF_MESSAGE"))
            .setColor(HibikiColors.Error),
        ],
      });
    }

    // Don't allow roleplay with the bot
    if (interaction.client.user.id === target.id) {
      await interaction.reply({
        embeds: [
          embed
            .setTitle(t("error:ERROR"))
            .setDescription(t("command:ROLEPLAY_BOT_MESSAGE"))
            .setColor(HibikiColors.Error),
        ],
      });

      return;
    }

    // Gets the string and URL to use
    switch (subcommand) {
      case "hug": {
        string = "command:ROLEPLAY_HUG_MESSAGE";
        url = "https://cdn.weeb.sh/images/B10Tfknqf.gif";
        break;
      }

      case "cuddle": {
        string = "command:ROLEPLAY_CUDDLE_MESSAGE";
        url = "https://cdn.weeb.sh/images/rkA6SU7w-.gif";
        break;
      }

      case "kiss": {
        string = "command:ROLEPLAY_KISS_MESSAGE";
        url = "https://cdn.weeb.sh/images/SkKL3adPb.gif";
        break;
      }

      case "pat": {
        string = "command:ROLEPLAY_PAT_MESSAGE";
        url = "command:COMMAND_ROLEPLAY_PAT_DETAILS";
        break;
      }

      case "slap": {
        string = "command:ROLEPLAY_SLAP_MESSAGE";
        url = "https://cdn.weeb.sh/images/HkA6mJFP-.gif";
        break;
      }

      default: {
        return;
      }
    }

    // Sends the embed
    await interaction.reply({
      embeds: [
        embed
          .setDescription(
            t(string, {
              lng: interaction.locale,
              user: interaction.user.globalName,
              target: target.globalName,
            }),
          )
          .setColor(HibikiColors.Primary)
          .setImage(url),
      ],
    });
  },
};
