import { HibikiCommand } from "$classes/Command.ts";
import { fetchTotalCachedUsers, fetchTotalCachedGuilds } from "$classes/Sharder.ts";
import { HibikiColors } from "$shared/constants.ts";
import env from "$shared/env.ts";
import { t } from "$shared/i18n.ts";
import { version, type ChatInputCommandInteraction } from "discord.js";

export class HibikiPingCommand extends HibikiCommand {
  public async runWithInteraction(interaction: ChatInputCommandInteraction, locale: string) {
    // Gets the amount of cached guilds and users
    const totalCachedGuilds = await fetchTotalCachedGuilds(this.bot.shard);
    const totalCachedUsers = await fetchTotalCachedUsers(this.bot.shard);

    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_ABOUT_TITLE", { username: this.bot.user?.username, lng: locale }),
          description: t("COMMAND_ABOUT_DETAILS", { username: this.bot.user?.username, lng: locale }),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: t("COMMAND_ABOUT_CACHED_GUILDS", { lng: locale }),
              value: `${totalCachedGuilds}`,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_CACHED_USERS", { lng: locale }),
              value: `${totalCachedUsers}`,
              inline: true,
            },
            {
              // TODO: Localize
              name: t("COMMAND_ABOUT_UPTIME", { lng: locale }),
              value: `${Math.floor(process.uptime())} seconds`,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_HIBIKI_VERSION", { lng: locale }),
              value: env.npm_package_version,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_DISCORDJS_VERSION", { lng: locale }),
              value: version,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_BUN_VERSION", { lng: locale }),
              value: Bun.version,
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
