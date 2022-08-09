import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class DonateCommand extends HibikiCommand {
  description = "Returns information on how you can donate to the Hibiki project.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("general.COMMAND_DONATE_TITLE"),
          description: interaction.getString("general.COMMAND_DONATE_DESCRIPTION", { link: "https://ko-fi.com/sysdotini" }),
          color: this.bot.config.colours.secondary,
        },
      ],
    });
  }
}
