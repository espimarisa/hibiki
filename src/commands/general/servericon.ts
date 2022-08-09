import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class ServericonCommand extends HibikiCommand {
  description = "Displays the server's icon.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    const guild = await interaction.guild?.fetch();

    // Handler for if no guild was fetched?
    if (!guild) {
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_SERVERICON_ERROR"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Gets the icon
    const icon = guild?.iconURL({ size: 1024 });

    // Handler for if the guild doesn't have an icon
    if (!icon) {
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_SERVERICON_NOICON", { server: guild.name }),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
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
