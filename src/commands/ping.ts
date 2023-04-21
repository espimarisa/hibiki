/**
 * @file Ping
 * @description Ping command
 */

import type { CommandInteraction } from "@projectdysnomia/dysnomia";
import { HibikiCommand } from "../classes/Command.js";
import { HibikiColors } from "../utils/constants.js";

export class HibikiPingCommand extends HibikiCommand {
  description = "Checks the current status and latency.";

  public async runWithInteraction(interaction: CommandInteraction) {
    // Sends the initial message
    await interaction.createFollowup({
      embeds: [
        {
          title: interaction.getString("COMMAND_PING_PINGING"),
          description: interaction.getString("COMMAND_PING_ERROR"),
          color: HibikiColors.GENERAL,
        },
      ],
    });

    // Gets the original message
    const originalMessage = await interaction.getOriginalMessage();

    // Sends the edited timestamp
    await interaction.editOriginalMessage({
      embeds: [
        {
          title: interaction.getString("COMMAND_PING_PONG"),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: interaction.getString("COMMAND_PING_UPTIME"),
              value: `${new Date(this.bot.uptime).getMinutes()}`,
              inline: true,
            },
            {
              name: interaction.getString("COMMAND_PING_LATENCY"),
              value: `${originalMessage.createdAt - interaction.createdAt}ms`,
              inline: true,
            },
          ],
        },
      ],
    });
  }
}
