import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class GdprCommand extends HibikiCommand {
  description = "Returns GDPR information.";

  options?: ApplicationCommandOptionData[] | undefined = [
    {
      name: "Guild ID",
      type: "STRING",
      description: "The ID Of the guild you want to fetch data for. Leave blank to get user data.",
      required: false,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction): Promise<void> {
    if (interaction.options.getString("Guild ID")) {
      const guild = await interaction.client.guilds.fetch(<string>interaction.options.getString("Guild ID"));
      if (!guild) {
        return interaction.reply({
          embeds: [
            {
              title: interaction.getString("global.ERROR"),
              description: interaction.getString("utilities.COMMAND_GDPR_NOGUILD_ERROR"),
              color: this.bot.config.colours.error,
            },
          ],
        });
      }

      const owner = await guild.fetchOwner();

      if (!owner) {
        return interaction.reply({
          embeds: [
            {
              title: interaction.getString("global.ERROR"),
              description: interaction.getString("utilities.COMMAND_GDPR_NOOWNER_ERROR"),
            },
          ],
        });
      }
      if (owner.id !== interaction.user.id) {
        return interaction.reply({
          embeds: [
            {
              title: interaction.getString("global.ERROR"),
              description: interaction.getString("utilities.COMMAND_GDPR_NOTOWNER_ERROR"),
              color: this.bot.config.colours.error,
            },
          ],
        });
      }

      const guildConfig = await this.bot.db.getGuildConfig(guild.id);
      if (!guildConfig) {
        await interaction.reply({
          embeds: [
            {
              title: interaction.getString("global.ERROR"),
              description: interaction.getString("utilities.COMMAND_GDPR_NOGUILDDATA_ERROR"),
            },
          ],
        });
      }
      const data = {
        guild_config: guildConfig,
      };

      const gdprResponse = await this.bot.web.generateGdprData(data, {
        initiatedBy: interaction.user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const expiryString = `<t:${gdprResponse.expires.getTime() / 1000}:R>`;
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.SUCCESS"),
            description: interaction.getString("utilities.COMMAND_GDPR_GUILDDATA_DESCRIPTION", {
              name: guild.name,
              link: gdprResponse.url,
              deleteLink: gdprResponse.deletion_url,
              expires: expiryString,
            }),
          },
        ],
      });
      return;
    }

    const userConfig = this.bot.db.getUserConfig(interaction.user.id);

    if (!userConfig) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_GDPR_NOUSERDATA_ERROR"),
          },
        ],
      });
    }

    const data = {
      user_config: userConfig,
    };

    const gdprResponse = await this.bot.web.generateGdprData(data, {
      initiatedBy: interaction.user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    const expiryString = `<t:${gdprResponse.expires.getTime() / 1000}:R>`;
    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("global.SUCCESS"),
          description: interaction.getString("utilities.COMMAND_GDPR_USERDATA_DESCRIPTION", {
            link: gdprResponse.url,
            deleteLink: gdprResponse.deletion_url,
            expiration: expiryString,
          }),
        },
      ],
    });

    return;
  }
}
