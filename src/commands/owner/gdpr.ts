import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { ApplicationCommandOptionType, type APIApplicationCommandOption } from "discord-api-types/v10";

export class GdprCommand extends HibikiCommand {
  description = "Returns GDPR information.";

  options: APIApplicationCommandOption[] = [
    {
      // NOTE: *Always* refer to guilds as *servers* to end-users. You can use guild internally, but keep it consistent - Espi
      // TODO: We currently have to hardcode this to the values in https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      // We should use strings and format them in the .toJson() method for my sanity sake
      // Using strings here will break everything!! Don't do it <3

      name: "server_id",
      type: ApplicationCommandOptionType.String,
      description: "The ID Of the server you want to fetch data for. Leave blank to get user data.",
      required: false,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction): Promise<void> {
    // NOTE: Always call the name[] directly to avoid breakage if we rename the actual var
    // Damn you, JS

    if (interaction.options.getString(this.options[0].name)) {
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

      // Gets the guild owner
      const owner = await guild.fetchOwner();

      if (!owner) {
        return interaction.reply({
          embeds: [
            {
              title: interaction.getString("global.ERROR"),
              description: interaction.getString("utilities.COMMAND_GDPR_NOOWNER_ERROR"),
              color: this.bot.config.colours.error,
            },
          ],
        });
      }

      // Ensures that the guild owner is the command runner
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

      // Gets guild configuration data
      const guildConfig = await this.bot.db.getGuildConfig(guild.id);
      if (!guildConfig) {
        await interaction.reply({
          embeds: [
            {
              title: interaction.getString("global.ERROR"),
              description: interaction.getString("utilities.COMMAND_GDPR_NOGUILDDATA_ERROR"),
              color: this.bot.config.colours.error,
            },
          ],
        });
      }

      // Creates the guildData object
      const guildData = {
        guild_config: guildConfig,
      };

      // Creates a GDPR response
      // @ts-expect-error Why can this be undefined? I'm not familiar w/ this yet, so please fix <3 - Espi
      const gdprResponse = await this.bot.web.generateGdprData(guildData, {
        initiatedBy: interaction.user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const guildGDPRExpiryString = `<t:${gdprResponse.expires.getTime() / 1000}:R>`;
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.SUCCESS"),
            description: interaction.getString("utilities.COMMAND_GDPR_GUILDDATA_DESCRIPTION", {
              name: guild.name,
              link: gdprResponse.url,
              deleteLink: gdprResponse.deletion_url,
              expires: guildGDPRExpiryString,
            }),
            color: this.bot.config.colours.primary,
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
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    const userData = {
      user_config: userConfig,
    };

    // @ts-expect-error Why can this be undefined? Shouldn't it always exist w/ the webserver? We *rely* on it - don't let selfhosters cut it off pls. I'm not familiar w/ this yet, so please fix <3 - Espi
    const userGDPRDataResponse = await this.bot.web.generateGdprData(userData, {
      initiatedBy: interaction.user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    // NOTE: Reminder that we have utilities/timestamp
    // We should add these to it eventually - Espi
    const expiryString = `<t:${userGDPRDataResponse.expires.getTime() / 1000}:R>`;

    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("global.SUCCESS"),
          description: interaction.getString("utilities.COMMAND_GDPR_USERDATA_DESCRIPTION", {
            link: userGDPRDataResponse.url,
            deleteLink: userGDPRDataResponse.deletion_url,
            expiration: expiryString,
          }),
        },
      ],
    });
  }
}
