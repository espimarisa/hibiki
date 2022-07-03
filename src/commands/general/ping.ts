import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class PingCommand extends HibikiCommand {
  description = "Checks the current status of the bot and returns current latency.";

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
