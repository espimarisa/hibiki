import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";

export class CoinCommand extends HibikiCommand {
  description = "Flips a coin.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    const coin = Math.random() < 0.5 ? interaction.getString("fun.COMMAND_COIN_HEADS") : interaction.getString("fun.COMMAND_COIN_TAILS");

    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("fun.COMMAND_COIN_TITLE"),
          description: interaction.getString("fun.COMMAND_COIN_DESCRIPTION", { coin }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
