import { HibikiCommand } from "$classes/Command.ts";
import { fetchTotalCachedGuilds, fetchTotalCachedUsers } from "$classes/Sharder.ts";
import { HibikiColors } from "$utils/constants.ts";
import { env } from "$utils/env.ts";
import { getTimeSince } from "$utils/format.ts";
import { t } from "$utils/i18n.ts";
import { localizeTimeSince } from "$utils/localize.ts";
import { type ChatInputCommandInteraction, type EmbedField, version } from "discord.js";

// Generates a timestamp upon process startup
const startupTimestamp = new Date();

export class AboutCommand extends HibikiCommand {
  userInstallable = true;

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the amount of cached guilds and users
    const totalCachedGuilds = await fetchTotalCachedGuilds(this.bot.shard);
    const totalCachedUsers = await fetchTotalCachedUsers(this.bot.shard);
    const fields: EmbedField[] = [];

    // Calculates uptime
    const uptime = getTimeSince(startupTimestamp, new Date());
    const localizedUptime = localizeTimeSince(uptime, interaction.locale);

    // Push cached guilds
    if (totalCachedGuilds) {
      fields.push({
        name: t("commands:COMMAND_ABOUT_CACHED_GUILDS", { lng: interaction.locale }),
        value: totalCachedGuilds.toString(),
        inline: true,
      });
    }

    // Push cached users
    if (totalCachedUsers) {
      fields.push({
        name: t("commands:COMMAND_ABOUT_CACHED_USERS", { lng: interaction.locale }),
        value: totalCachedUsers.toString(),
        inline: true,
      });
    }

    // Sends the embed
    await interaction.followUp({
      embeds: [
        {
          title: t("commands:COMMAND_ABOUT_TITLE", {
            username: interaction.client.user.username,
            lng: interaction.locale,
          }),
          description: t("commands:COMMAND_ABOUT_DETAILS", {
            username: interaction.client.user.username,
            lng: interaction.locale,
          }),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: t("commands:COMMAND_ABOUT_UPTIME", { lng: interaction.locale }),
              value: localizedUptime,
              inline: false,
            },
            {
              name: t("commands:COMMAND_ABOUT_HIBIKI_VERSION", { lng: interaction.locale }),
              value: env.npm_package_version,
              inline: true,
            },
            {
              name: t("commands:COMMAND_ABOUT_DISCORDJS_VERSION", { lng: interaction.locale }),
              value: version,
              inline: true,
            },
            {
              name: t("commands:COMMAND_ABOUT_BUN_VERSION", { lng: interaction.locale }),
              value: Bun.version,
              inline: true,
            },
            {
              name: t("commands:COMMAND_ABOUT_LOADED_COMMANDS", { lng: interaction.locale }),
              value: this.bot.commands.size.toString(),
              inline: true,
            },
            ...fields,
          ],
          thumbnail: {
            url: interaction.client.user.displayAvatarURL(),
          },
        },
      ],
    });
  }
}
