import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class PingCommand extends HibikiCommand {
  description = "Checks the current status of the bot - test owowowowowowowowoo.";

  public async runWithInteraction(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        {
          title: "ping",
          description: this.bot.ws.ping.toString(),
        },
      ],
    });
  }
}
