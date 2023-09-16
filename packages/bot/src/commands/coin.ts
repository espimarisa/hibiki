import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiColors } from "../../../shared/src/constants.js";
import { HibikiCommand } from "../classes/Command.js";
import { t } from "$shared/i18n.js";

export class CoinCommand extends HibikiCommand {
  description = "Flips a coin and selects heads or tails.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    const coin = Math.random() < 0.5;

    // Gets a "heads" or "tails" string
    const coinString = coin ? t("COMMAND_COIN_TAILS", { lng: interaction.lng }) : t("COMMAND_COIN_HEADS", { lng: interaction.lng });

    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_COIN_TITLE", { lng: interaction.lng }),
          description: t("COMMAND_COIN_DESCRIPTION", { side: coinString, lng: interaction.lng }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
