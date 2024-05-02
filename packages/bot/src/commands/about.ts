import { HibikiCommand } from "$classes/Command.ts";
import { fetchTotalCachedGuilds, fetchTotalCachedUsers } from "$classes/Sharder.ts";
import { HibikiColors } from "$shared/constants.ts";
import { env } from "$shared/env.ts";
import { t } from "$shared/i18n.ts";
import { getTimeSince } from "$utils/format.ts";
import { localizeTimeSince } from "$utils/localize.ts";
import { type ChatInputCommandInteraction, type EmbedField, version } from "discord.js";

// Generates a timestamp upon process startup
const startupTimestamp = new Date();

export class AboutCommand extends HibikiCommand {
  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the amount of cached guilds and users
    const totalCachedGuilds = await fetchTotalCachedGuilds(this.bot.shard);
    const totalCachedUsers = await fetchTotalCachedUsers(this.bot.shard);
    const fields: EmbedField[] = [];

    const uptime = getTimeSince(startupTimestamp, new Date());
    const localizedUptime = localizeTimeSince(uptime, interaction.locale);

    // Push cached guilds
    if (totalCachedGuilds) {
      fields.push({
        name: t("COMMAND_ABOUT_CACHED_GUILDS", { lng: interaction.locale, ns: "commands" }),
        value: totalCachedGuilds.toString(),
        inline: true,
      });
    }

    // Push cached users
    if (totalCachedUsers) {
      fields.push({
        name: t("COMMAND_ABOUT_CACHED_USERS", { lng: interaction.locale, ns: "commands" }),
        value: totalCachedUsers.toString(),
        inline: true,
      });
    }

    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_ABOUT_TITLE", {
            username: this.bot.user?.username,
            lng: interaction.locale,
            ns: "commands",
          }),
          description: t("COMMAND_ABOUT_DETAILS", {
            username: this.bot.user?.username,
            lng: interaction.locale,
            ns: "commands",
          }),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: t("COMMAND_ABOUT_UPTIME", { lng: interaction.locale, ns: "commands" }),
              value: localizedUptime,
              inline: false,
            },
            {
              name: t("COMMAND_ABOUT_HIBIKI_VERSION", { lng: interaction.locale, ns: "commands" }),
              value: env.npm_package_version,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_DISCORDJS_VERSION", { lng: interaction.locale, ns: "commands" }),
              value: version,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_BUN_VERSION", { lng: interaction.locale, ns: "commands" }),
              value: Bun.version,
              inline: true,
            },
            {
              name: t("COMMAND_ABOUT_LOADED_COMMANDS", { lng: interaction.locale, ns: "commands" }),
              value: this.bot.commands.size.toString(),
              inline: true,
            },
            ...fields,
          ],
          thumbnail: {
            url: this.bot.user?.displayAvatarURL() ?? "",
          },
        },
      ],
    });
  }
}
