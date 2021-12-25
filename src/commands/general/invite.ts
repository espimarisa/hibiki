import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class InviteCommand extends HibikiCommand {
  description = "Gives a link to invite me to your server.";

  public async run(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        {
          title: interaction.getLocaleString("general.COMMAND_INVITE_TITLE"),
          description: interaction.getLocaleString("general.COMMAND_INVITE_DESCRIPTION", { id: this.bot.user?.id }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
