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
          // TODO: Localise
          title: "Pinging....",
          description: "If you see this for more than a few seconds, something has gone seriously wrong...",
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
          // TODO: Localise
          title: "🏓 Pong!",
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: "Client Uptime",
              value: `${new Date(this.bot.uptime).getMinutes()} min`,
              inline: true,
            },
            {
              name: "Roundtrip Latency",
              value: `${originalMessage.createdAt - interaction.createdAt}ms`,
              inline: true,
            },
          ],
        },
      ],
    });
  }
}
