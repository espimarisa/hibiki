/**
 * @file Chat command that returns information and statistics about the bot.
 * @license zlib
 */

import { memoryUsage } from "node:process";
import { version } from "discord.js";
import { getTotalCachedUsers, getTotalGuilds } from "@/helpers/discord.ts";
import { HibikiColors, INVITE_PERMISSIONS, ZWSP } from "@/utils/constants.ts";
import { env } from "@/utils/env.ts";
import { getTimeSince } from "@/utils/format.ts";
import { t, tAllD, tAllN, tBytes, tD, tTime } from "@/utils/i18n.ts";

const startupTimestamp = new Date();

export const aboutCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Defers the reply.
    await interaction.deferReply();

    // Gets uptime and memory statistics.
    const uptime = getTimeSince(startupTimestamp, new Date());
    const memory = Math.round(memoryUsage().heapUsed);
    const localizedUptime = tTime(uptime, interaction.locale);
    const localizedMemory = tBytes(memory, interaction.locale);

    // Gets the total amount of cached guilds and users.
    const totalGuilds = await getTotalGuilds(interaction.client.sharder);
    const cachedUsers = await getTotalCachedUsers(interaction.client.sharder);

    // Sends the reply.
    await interaction.followUp({
      // flags: ["Ephemeral"],
      embeds: [
        {
          color: HibikiColors.Primary,
          title: t("commands:about.response.title", {
            lng: interaction.locale,
            username: interaction.client.user.username,
          }),
          description: t("commands:about.response.description", {
            lng: interaction.locale,
          }),
          thumbnail: {
            url: interaction.client.user.displayAvatarURL({ size: 512 }),
          },
          fields: [
            {
              // Statistics.
              name: t("common:statistics", { lng: interaction.locale }),
              value: t("commands:about.response.systemDetails", {
                lng: interaction.locale,
                guilds: totalGuilds,
                users: cachedUsers,
                commands: interaction.client.commands.size,
              }),
              inline: true,
            },
            {
              // Versioning.
              name: t("common:version", { lng: interaction.locale }),
              value: t("commands:about.response.versionDetails", {
                lng: interaction.locale,
                hibiki: env.npm_package_version,
                djs: version,
                bun: Bun.version_with_sha,
              }),
              inline: true,
            },
            {
              // System.
              name: t("common:system", { lng: interaction.locale }),
              value: t("commands:about.response.systemDetails", {
                lng: interaction.locale,
                uptime: localizedUptime,
                memory: localizedMemory,
              }),
              inline: false,
            },
            {
              // Links.
              name: ZWSP,
              value: t("commands:about.response.links", {
                lng: interaction.locale,
                id: interaction.client.user.id,
                permissions: INVITE_PERMISSIONS,
              }),
              inline: false,
            },
          ],
        },
      ],
    });
  },

  data: () => {
    return {
      name: "about",
      name_localizations: tAllN("commands:about.name"),
      description: tD("commands:about.description"),
      description_localizations: tAllD("commands:about.description"),
    };
  },
};
