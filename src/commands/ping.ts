import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { HibikiColors } from "../utils/constants.js";

export class HibikiPingCommand extends HibikiCommand {
  description = "Checks the current status and latency.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Sends the initial message
    await interaction.followUp({
      embeds: [
        {
          title: interaction.getString("COMMAND_PING_PINGING"),
          description: interaction.getString("COMMAND_PING_ERROR"),
          color: HibikiColors.GENERAL,
        },
      ],
    });

    // Sends the edited timestamp
    await interaction.editReply({
      embeds: [
        {
          title: interaction.getString("COMMAND_PING_PONG"),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: interaction.getString("COMMAND_PING_UPTIME"),
              value: `${Math.round(this.bot.ws.client.uptime as number) / 60_000}`,
              inline: true,
            },
            {
              name: interaction.getString("COMMAND_PING_API"),
              value: `${interaction.client.ws.ping}`,
              inline: true,
            },
            {
              name: interaction.getString("COMMAND_PING_ROUNDTRIP"),
              value: `${Math.round(Date.now() - interaction.createdTimestamp)}`,
              inline: true,
            },
          ],
        },
      ],
    });
  }
}
