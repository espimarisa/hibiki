import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { fetchTotalCachedGuilds, fetchTotalCachedUsers } from "../classes/Sharder.js";
import { HibikiColors } from "$shared/constants.js";
import { sanitizedEnv } from "$shared/env.js";
import { t } from "$shared/i18n.js";
import { version as discordJSVersion } from "discord.js";

export class HibikiAboutCommand extends HibikiCommand {
  description = "Provides information and statistics about the bot.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets the amount of cached guilds and users
    const totalCachedGuilds = await fetchTotalCachedGuilds(this.bot.shard);
    const totalCachedUsers = await fetchTotalCachedUsers(this.bot.shard);

    // Sends the initial message
    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_ABOUT_TITLE", { username: this.bot.user?.username, lng: interaction.lng }),
          description: t("COMMAND_ABOUT_DESCRIPTION", { username: this.bot.user?.username, lng: interaction.lng }),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: t("COMMAND_ABOUT_CACHED_GUILDS", { lng: interaction.lng }),
              value: `${totalCachedGuilds}`,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_CACHED_USERS", { lng: interaction.lng }),
              value: `${totalCachedUsers}`,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_UPTIME", { lng: interaction.lng }),
              value: `${Math.floor(process.uptime())} seconds`,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_HIBIKI_VERSION", { lng: interaction.lng }),
              value: sanitizedEnv.npm_package_version,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_DISCORDJS_VERSION", { lng: interaction.lng }),
              value: discordJSVersion,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_NODEJS_VERSION", { lng: interaction.lng }),
              value: process.version,
              inline: true,
            },
          ],
          thumbnail: {
            url: this.bot.user?.displayAvatarURL() ?? "",
          },
        },
      ],
    });
  }
}
