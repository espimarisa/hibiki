/**
 * @file Slash command that returns information and statistics about itself.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/slash/about
 */

import { HibikiColors, INVITE_PERMISSIONS, ZWSP } from "@/utils/constants.js";
import { getTotalCachedUsers, getTotalGuilds } from "@/utils/discord.js";
import { env } from "@/utils/env.js";
import { getTimeSince } from "@/utils/format.js";
import { localizeBytes, localizeTime, t, tObj } from "@/utils/i18n.js";
import { memoryUsage } from "node:process";
import { EmbedBuilder, SlashCommandBuilder, version } from "discord.js";

const startupTimestamp = new Date();

export const aboutCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setNameLocalizations(tObj("commands:ABOUT_NAME"))
    .setDescription(t("commands:ABOUT_DESCRIPTION"))
    .setDescriptionLocalizations(tObj("commands:ABOUT_DESCRIPTION")),

  async runCommand(interaction) {
    await interaction.deferReply();

    // Gets and localizes uptime, memory, and cache data
    const uptime = getTimeSince(startupTimestamp, new Date());
    const memory = Math.round(memoryUsage().heapUsed);
    const localizedUptime = localizeTime(uptime, interaction.locale);
    const localizedMemory = localizeBytes(memory, interaction.locale);
    const totalGuilds = (await getTotalGuilds(interaction.client.sharder)) || 1;
    const cachedUsers =
      (await getTotalCachedUsers(interaction.client.sharder)) || 1;

    // Creates the embed
    const embed = new EmbedBuilder()
      .setTitle(
        t("commands:ABOUT_TITLE", {
          lng: interaction.locale,
          username: interaction.user.client.user.username,
        }),
      )
      .setDescription(
        t("commands:ABOUT_DETAILS", {
          lng: interaction.locale,
        }),
      )
      .setColor(HibikiColors.Primary)
      .setThumbnail(
        interaction.user.client.user.displayAvatarURL({ size: 512 }),
      )
      .addFields(
        {
          // Total servers
          name: t("commands:ABOUT_STATISTICS", { lng: interaction.locale }),
          value: t("commands:ABOUT_STATISTICS_DETAILS", {
            lng: interaction.locale,
            servers: totalGuilds,
            users: cachedUsers,
            commands: interaction.client.commands?.size,
          }),
          inline: true,
        },
        {
          // Versioning
          name: t("commands:ABOUT_VERSION", { lng: interaction.locale }),
          value: t("commands:ABOUT_VERSION_DETAILS", {
            lng: interaction.locale,
            hibiki: env.npm_package_version,
            djs: version,
            bun: Bun.version_with_sha,
          }),
          inline: true,
        },
        {
          // Bot uptime
          name: t("commands:ABOUT_STATSFORNERDS", { lng: interaction.locale }),
          value: t("commands:ABOUT_STATSFORNERDS_DETAILS", {
            lng: interaction.locale,
            uptime: localizedUptime,
            memory: localizedMemory,
          }),
          inline: false,
        },
        {
          // Links
          name: ZWSP,
          value: t("commands:ABOUT_LINKS", {
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
