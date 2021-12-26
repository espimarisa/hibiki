import { HibikiCommand } from "../../classes/Command";
import { fetchTotalCachedGuilds } from "../../classes/Sharder";
import { CommandInteraction, version as djsVersion } from "discord.js";

export class AboutCommand extends HibikiCommand {
  description = "Returns information and statistics about the bot.";

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets cached guilds
    const guildCount = await fetchTotalCachedGuilds(this.bot.shard);

    // Statistic string
    const statsString = interaction.getLocaleString("general.COMMAND_ABOUT_STATISTICS_STRING", {
      shards: this.bot.shard?.ids.length,
      guilds: guildCount?.toString(),
      commands: this.bot.commands.size,
    });

    // Module versions
    const moduleString = interaction.getLocaleString("general.COMMAND_ABOUT_MODULES_STRING", {
      botVersion: process.env.npm_package_version,
      djsVersion: djsVersion,
      nodeVersion: process.version,
    });

    // Links
    const linkString = interaction.getLocaleString("general.COMMAND_ABOUT_LINK_STRING", {
      donate: "https://ko-fi.com/sysdotini",
      invite: `https://discord.com/oauth2/authorize?&client_id=${this.bot.user?.id}&scope=bot%20applications.commands&permissions=1581116663`,
      privacy: "https://github.com/sysdotini/hibiki/tree/main#privacy-policy",
      github: "https://github.com/sysdotini/hibiki",
      translate: "https://translate.hibiki.app",
    });

    await interaction.reply({
      embeds: [
        {
          title: interaction.getLocaleString("general.COMMAND_ABOUT_TITLE"),
          description: interaction.getLocaleString("general.COMMAND_ABOUT_DESCRIPTION", {
            username: this.bot.user?.username,
          }),
          color: this.bot.config.colours.primary,
          fields: [
            {
              name: interaction.getLocaleString("general.COMMAND_ABOUT_STATISTICS"),
              value: statsString,
              inline: true,
            },
            {
              name: interaction.getLocaleString("general.COMMAND_ABOUT_MODULES"),
              value: moduleString,
              inline: true,
            },
            {
              name: interaction.getLocaleString("global.LINKS"),
              value: linkString,
              inline: false,
            },
          ],
          thumbnail: {
            url: this.bot.user?.displayAvatarURL({ dynamic: true }),
          },
        },
      ],
    });
  }
}
