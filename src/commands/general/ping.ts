import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class PingCommand extends HibikiCommand {
  description = "Checks the current status of the bot and returns current shard latency.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    await interaction.followUp({
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
