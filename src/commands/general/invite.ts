import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class InviteCommand extends HibikiCommand {
  description = "Gives a link to invite the bot to a server.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("general.COMMAND_INVITE_TITLE"),
          description: interaction.getString("general.COMMAND_INVITE_DESCRIPTION", { id: this.bot.user?.id }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
