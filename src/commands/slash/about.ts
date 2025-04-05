/**
 * @file Slash command that returns information and statistics about itself.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/slash/about
 */

import { getTotalCachedUsers, getTotalGuilds } from "@/root/index.js";
import { HibikiColors, INVITE_PERMISSIONS, ZWSP } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { fetchClientEmoji } from "@/utils/fetch.js";
import { getTimeSince, localizeBytes, localizeTime } from "@/utils/format.js";
import { t, tMap } from "@/utils/i18n.js";
import { memoryUsage } from "node:process";
import { EmbedBuilder, SlashCommandBuilder, version } from "discord.js";

const startupTimestamp = new Date();
const fallbackEmoji = "💖";
let emoji = fallbackEmoji;

export const aboutCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setNameLocalizations(tMap("command:ABOUT_NAME"))
    .setDescription(t("command:ABOUT_DESCRIPTION"))
    .setDescriptionLocalizations(tMap("command:ABOUT_DESCRIPTION")),

  async runCommand(interaction) {
    await interaction.deferReply();

    // Gets and localizes uptime, memory, and cache data
    const uptime = getTimeSince(startupTimestamp, new Date());
    const memory = Math.round(memoryUsage().heapUsed);
    const localizedUptime = localizeTime(uptime, interaction.locale);
    const localizedMemory = localizeBytes(memory, interaction.locale);
    const totalGuilds = (await getTotalGuilds()) || 1;
    const cachedUsers = (await getTotalCachedUsers()) || 1;

    // Gets the about emoji to use if it isn't already set
    if (emoji === fallbackEmoji) {
      emoji = await fetchClientEmoji(
        interaction.client,
        env.EMOJI_BLOBCAT_COOKIE,
        emoji,
      );
    }

    // Creates the embed
    const embed = new EmbedBuilder()
      .setTitle(
        t("command:ABOUT_TITLE", {
          lng: interaction.locale,
          username: interaction.user.client.user.username,
        }),
      )
      .setDescription(
        t("command:ABOUT_DETAILS", {
          emoji: emoji,
          lng: interaction.locale,
        }),
      )
      .setColor(HibikiColors.Primary)
      .setThumbnail(interaction.user.client.user.displayAvatarURL())
      .addFields(
        {
          // Total servers
          name: t("command:ABOUT_STATISTICS", { lng: interaction.locale }),
          value: t("command:ABOUT_STATISTICS_DETAILS", {
            lng: interaction.locale,
            servers: totalGuilds,
            users: cachedUsers,
            commands: interaction.client.slashCommands?.size,
          }),
          inline: true,
        },
        {
          // Versioning
          name: t("command:ABOUT_VERSION", { lng: interaction.locale }),
          value: t("command:ABOUT_VERSION_DETAILS", {
            lng: interaction.locale,
            hibiki: env.npm_package_version,
            djs: version,
            bun: Bun.version_with_sha,
          }),
          inline: true,
        },
        {
          // Bot uptime
          name: t("command:ABOUT_STATSFORNERDS", { lng: interaction.locale }),
          value: t("command:ABOUT_STATSFORNERDS_DETAILS", {
            lng: interaction.locale,
            uptime: localizedUptime,
            memory: localizedMemory,
          }),
          inline: false,
        },
        {
          // Links
          name: ZWSP,
          value: t("command:ABOUT_LINKS", {
            lng: interaction.locale,
            id: interaction.client.user.id,
            permissions: INVITE_PERMISSIONS,
          }),
          inline: false,
        },
      );

    // Sends the interaction
    await interaction.followUp({ embeds: [embed] });
  },
};
