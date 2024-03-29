import type { ChatInputCommandInteraction } from "discord.js";

import { HibikiCommand } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";

export class HibikiPingCommand extends HibikiCommand {
  public async runWithInteraction(interaction: ChatInputCommandInteraction, locale: string) {
    const initialInteraction = await interaction.followUp({
      fetchReply: true,
      embeds: [
        {
          title: t("COMMAND_PING_PINGING", { lng: locale }),
          color: HibikiColors.GENERAL,
        },
      ],
    });

    await interaction.editReply({
      embeds: [
        {
          title: t("COMMAND_PING_PONG", { lng: locale }),
          description: t("COMMAND_PING_LATENCY", {
            lng: locale,
            latency: initialInteraction.createdTimestamp - interaction.createdTimestamp,
          }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
