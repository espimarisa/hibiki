import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class ServericonCommand extends HibikiCommand {
  description = "Displays the server's icon.";

  public async runWithInteraction(interaction: CommandInteraction) {
    const guild = await interaction.guild?.fetch();

    // Handler for if no guild was fetched?
    if (!guild) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_SERVERICON_ERROR"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Gets the icon
    const icon = guild?.iconURL({ dynamic: true, size: 1024 });

    // Handler for if the guild doesn't have an icon
    if (!icon) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_SERVERICON_NOICON", { server: guild.name }),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Sends the icon
    await interaction.reply({
      embeds: [
        {
          color: this.bot.config.colours.primary,
          author: {
            icon_url: icon.toString(),
            name: interaction.getString("general.COMMAND_SERVERICON_DESCRIPTION", { server: guild.name }),
          },
          image: {
            url: icon,
          },
        },
      ],
    });
  }
}
