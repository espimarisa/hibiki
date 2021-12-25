import { HibikiCommand } from "../../classes/Command";
import { fetchTotalCachedGuilds } from "../../classes/Sharder";
import { CommandInteraction, Interaction, Message, version as djsVersion } from "discord.js";

export class AboutCommand extends HibikiCommand {
  description = "Returns information and statistics about the bot.";

  public async getResponse(localeParser: GetLocaleString) {
    // Gets cached guilds
    const guildCount = await fetchTotalCachedGuilds(this.bot.shard);

    // Statistic string
    const statsString = localeParser("general.COMMAND_ABOUT_STATISTICS_STRING", {
      shards: this.bot.shard?.ids.length,
      guilds: guildCount?.toString(),
      commands: this.bot.commands.size,
    });

    // Module versions
    const moduleString = localeParser("general.COMMAND_ABOUT_MODULES_STRING", {
      botVersion: process.env.npm_package_version,
      djsVersion: djsVersion,
      nodeVersion: process.version,
    });

    // Links
    const linkString = localeParser("general.COMMAND_ABOUT_LINK_STRING", {
      donate: "https://ko-fi.com/sysdotini",
      invite: `https://discord.com/oauth2/authorize?&client_id=${this.bot.user?.id}&scope=bot%20applications.commands&permissions=1581116663`,
      privacy: "https://github.com/sysdotini/hibiki/tree/main#privacy-policy",
      github: "https://github.com/sysdotini/hibiki",
      translate: "https://translate.hibiki.app",
    });

    const embeds: FullMessageEmbedData = {
      embeds: [
        {
          title: localeParser("general.COMMAND_ABOUT_TITLE"),
          description: localeParser("general.COMMAND_ABOUT_DESCRIPTION", {
            username: this.bot.user?.username,
          }),
          color: this.bot.config.colours.primary,
          fields: [
            {
              name: localeParser("general.COMMAND_ABOUT_STATISTICS"),
              value: statsString,
              inline: true,
            },
            {
              name: localeParser("general.COMMAND_ABOUT_MODULES"),
              value: moduleString,
              inline: true,
            },
            {
              name: localeParser("global.LINKS"),
              value: linkString,
              inline: false,
            },
          ],
          thumbnail: {
            url: this.bot.user?.displayAvatarURL({ dynamic: true }),
          },
        },
      ],
    };

    return embeds;
  }

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets cached guilds and users
    const response = await this.getResponse(interaction.getLocaleString);
    await interaction.reply(response);
  }

  public async runWithMessage(msg: Message) {
    // @ts-expect-error Not yet implemented
    const response = await this.getResponse(msg.getLocaleString);
    // @ts-expect-error Not yet implemented
    await Interaction.reply(response);
  }
}
