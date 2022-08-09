import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class InvitebannerCommand extends HibikiCommand {
  description = "Displays the server's invite splash banner.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    const guild = await interaction.guild?.fetch();

    // Handler for if no guild was fetched?
    if (!guild) {
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_INVITEBANNER_ERROR"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Gets the banner
    const banner = guild?.splashURL({ size: 2048 });

    // Handler for if the guild doesn't have an banner
    if (!banner) {
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_INVITEBANNER_NOBANNER", { server: guild.name }),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Sends the banner
    await interaction.reply({
      embeds: [
        {
          color: this.bot.config.colours.primary,
          author: {
            icon_url: banner,
            name: interaction.getString("general.COMMAND_INVITEBANNER_DESCRIPTION", { server: guild.name }),
          },
          image: {
            url: banner,
          },
        },
      ],
    });
  }
}
