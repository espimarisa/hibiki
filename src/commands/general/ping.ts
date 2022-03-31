import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class PingCommand extends HibikiCommand {
  description = "Returns the bot's latency.";

  public async runWithInteraction(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("general.COMMAND_PING_PONG"),
          description: interaction.getString("general.COMMAND_PING_DESCRIPTION", { latency: this.bot.ws.ping }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
