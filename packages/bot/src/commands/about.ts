import { type ChatInputCommandInteraction, type EmbedField, version } from "discord.js";

import { HibikiCommand } from "$classes/Command.ts";
import { fetchTotalCachedGuilds, fetchTotalCachedUsers } from "$classes/Sharder.ts";
import { HibikiColors } from "$shared/constants.ts";
import env from "$shared/env.ts";
import { t } from "$shared/i18n.ts";
import { getTimeSince } from "$utils/format.ts";
import { localizeTimeSince } from "$utils/localize.ts";

// Generates a timestamp upon process startup
const startupTimestamp = new Date();

export class HibikiPingCommand extends HibikiCommand {
  public async runWithInteraction(interaction: ChatInputCommandInteraction, locale: string) {
    // Gets the amount of cached guilds and users
    const totalCachedGuilds = await fetchTotalCachedGuilds(this.bot.shard);
    const totalCachedUsers = await fetchTotalCachedUsers(this.bot.shard);
    const fields: EmbedField[] = [];

    const uptime = getTimeSince(startupTimestamp, new Date());
    const localizedUptime = localizeTimeSince(uptime, interaction.locale);

    // Push cached guilds
    if (totalCachedGuilds) {
      fields.push({
        name: t("COMMAND_ABOUT_CACHED_GUILDS", { lng: locale }),
        value: totalCachedGuilds.toString(),
        inline: true,
      });
    }

    // Push cached users
    if (totalCachedUsers) {
      fields.push({
        name: t("COMMAND_ABOUT_CACHED_USERS", { lng: locale }),
        value: totalCachedUsers.toString(),
        inline: true,
      });
    }

    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_ABOUT_TITLE", { username: this.bot.user?.username, lng: locale }),
          description: t("COMMAND_ABOUT_DETAILS", { username: this.bot.user?.username, lng: locale }),
          color: HibikiColors.GENERAL,
          fields: [
            ...fields,
            {
              name: t("COMMAND_ABOUT_UPTIME", { lng: locale }),
              value: localizedUptime,
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
