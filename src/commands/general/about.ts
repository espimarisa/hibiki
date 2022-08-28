import { HibikiCommand } from "../../classes/Command.js";
import { fetchTotalCachedGuilds } from "../../classes/Sharder.js";
import { hibikiVersion } from "../../utils/constants.js";
import { ChatInputCommandInteraction, version as djsVersion } from "discord.js";

export class AboutCommand extends HibikiCommand {
  description = "Returns information and statistics about the bot.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets cached guilds
    const guildCount = await fetchTotalCachedGuilds(this.bot.shard);

    // Statistic string
    const statsString = interaction.getString("general.COMMAND_ABOUT_STATISTICS_STRING", {
      shards: this.bot.shard?.ids.length,
      guilds: guildCount?.toString(),
      commands: this.bot.commands.size,
    });

    // Module versions
    const moduleString = interaction.getString("general.COMMAND_ABOUT_MODULES_STRING", {
      botVersion: hibikiVersion,
      djsVersion: djsVersion,
      nodeVersion: process.version,
    });

    // Links
    const linkString = interaction.getString("general.COMMAND_ABOUT_LINK_STRING", {
      donate: "https://ko-fi.com/sysdotini",
      invite: `https://discord.com/oauth2/authorize?&client_id=${this.bot.user?.id}&scope=bot%20applications.commands&permissions=1581116663`,
      privacy: "https://github.com/sysdotini/hibiki/tree/main#privacy-policy",
      github: "https://github.com/sysdotini/hibiki",
      translate: "https://translate.hibiki.app",
    });

    await interaction.followUp({
      embeds: [
        {
          title: interaction.getString("general.COMMAND_ABOUT_TITLE"),
          description: interaction.getString("general.COMMAND_ABOUT_DESCRIPTION", { username: this.bot.user?.username }),
          color: this.bot.config.colours.primary,
          fields: [
            {
              name: interaction.getString("general.COMMAND_ABOUT_STATISTICS"),
              value: statsString,
              inline: true,
            },
            {
              name: interaction.getString("general.COMMAND_ABOUT_MODULES"),
              value: moduleString,
              inline: true,
            },
            {
              name: interaction.getString("global.LINKS"),
              value: linkString,
              inline: false,
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
