/**
 * @file Slash command to get information and statistics about the bot.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { HibikiCommand } from "@/helpers/command.js";
import { getTotalCachedUsers, getTotalGuilds } from "@/helpers/discord.js";
import { env } from "@/root/utils/env.js";
import { HibikiColors, INVITE_PERMISSIONS } from "@/utils/constants.js";
import { getTimeSince } from "@/utils/format.js";
import { t, tO } from "@/utils/i18n.js";
import { localizeBytes, localizeTime } from "@/utils/localize.js";
import { memoryUsage } from "node:process";
import { EmbedBuilder, SlashCommandBuilder, version } from "discord.js";

const startupTimestamp = new Date();

export const aboutCommand = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setNameLocalizations(tO("commands:ABOUT_NAME"))
    .setDescription(t("commands:ABOUT_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:ABOUT_DESCRIPTION")),

  async run(interaction) {
    // Defers the reply
    await interaction.deferReply();

    // Gets uptime and memory statistics
    const uptime = getTimeSince(startupTimestamp, new Date());
    const memory = Math.round(memoryUsage().heapUsed);
    const localizedUptime = localizeTime(uptime, interaction.locale);
    const localizedMemory = localizeBytes(memory, interaction.locale);

    // Gets the total amount of cached guilds and users
    const cachedGuilds = await getTotalGuilds(interaction.client.sharder);
    const cachedUsers = await getTotalCachedUsers(interaction.client.sharder);

    // Sends the interaction
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            t("commands:ABOUT_TITLE", {
              lng: interaction.locale,
              username: interaction.client.user.username,
            }),
          )
          .setDescription(
            t("commands:ABOUT_DETAILS", {
              lng: interaction.locale,
            }),
          )
          .setColor(HibikiColors.Primary)
          .setThumbnail(interaction.client.user.displayAvatarURL({ size: 512 }))
          .addFields(
            {
              // Total servers
              name: t("common:STATISTICS", { lng: interaction.locale }),
              value: t("commands:ABOUT_STATISTICS_DETAILS", {
                lng: interaction.locale,
                servers: cachedGuilds,
                users: cachedUsers,
                commands: interaction.client.commands.size,
              }),
              inline: true,
            },
            {
              // Versioning
              name: t("common:VERSION", { lng: interaction.locale }),
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
              name: t("commands:ABOUT_SYSTEM", {
                lng: interaction.locale,
              }),
              value: t("commands:ABOUT_SYSTEM_DETAILS", {
                lng: interaction.locale,
                uptime: localizedUptime,
                memory: localizedMemory,
              }),
              inline: false,
            },
            {
              // Links
              name: "\u200b",
              value: t("commands:ABOUT_LINKS", {
                lng: interaction.locale,
                id: interaction.client.user.id,
                permissions: INVITE_PERMISSIONS,
              }),
              inline: false,
            },
          ),
      ],
    });
  },
} satisfies HibikiCommand;
