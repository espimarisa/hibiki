import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { HibikiColors } from "$shared/constants.js";
import { t } from "$shared/i18n.js";

export class HibikiPingCommand extends HibikiCommand {
  description = "Checks the current status and latency.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Sends the initial message
    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_PING_PINGING", { lng: interaction.lng }),
          description: t("COMMAND_PING_INITIAL_DESCRIPTION", { lng: interaction.lng }),
          color: HibikiColors.GENERAL,
        },
      ],
    });

    // Follows up with ping info
    await interaction.editReply({
      embeds: [
        {
          title: t("COMMAND_PING_PONG", { lng: interaction.lng }),
          color: HibikiColors.GENERAL,
          fields: [
            {
              name: t("COMMAND_PING_LATENCY", { lng: interaction.lng }),
              value: t("MILLISECONDS", { time: this.bot.ws.client.uptime ?? 60_000 / 60_000, lng: interaction.lng }),
              inline: true,
            },
            {
              name: t("COMMAND_PING_API_LATENCY", { lng: interaction.lng }),
              value: t("MILLISECONDS", { time: this.bot.ws.ping, lng: interaction.lng }),
              inline: true,
            },
            {
              name: t("COMMAND_PING_ROUNDTRIP_LATENCY", { lng: interaction.lng }),
              value: t("MILLISECONDS", { time: Math.round(Date.now() - interaction.createdTimestamp), lng: interaction.lng }),
              inline: true,
            },
          ],
        },
      ],
    });
  }
}
