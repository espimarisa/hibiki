import { HibikiCommand } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import type { ChatInputCommandInteraction } from "discord.js";

export class PingCommand extends HibikiCommand {
  async runCommand(interaction: ChatInputCommandInteraction) {
    const initialInteraction = await interaction.followUp({
      fetchReply: true,
      embeds: [
        {
          title: t("COMMAND_PING_PING_PINGING", { lng: interaction.locale, ns: "commands" }),
          color: HibikiColors.GENERAL,
        },
      ],
    });

    await interaction.editReply({
      embeds: [
        {
          title: t("COMMAND_PING_PING_PONG", { lng: interaction.locale, ns: "commands" }),
          description: t("COMMAND_PING_PING_LATENCY", {
            latency: initialInteraction.createdTimestamp - interaction.createdTimestamp,
            lng: interaction.locale,
            ns: "commands",
          }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
