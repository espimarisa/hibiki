import type { CommandInteraction, CacheType } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class DonateCommand extends HibikiCommand {
  description = "Returns donation information.";

  public async runWithInteraction(interaction: CommandInteraction): Promise<void> {
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
