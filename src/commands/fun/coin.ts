import type { CommandInteraction, Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class CoinCommand extends HibikiCommand {
  description = "Flip a coin";

  public async runWithInteraction(interaction: CommandInteraction) {
    const coin = Math.random() < 0.5 ? "heads" : "tails";

    await interaction.reply({
      embeds: [
        {
          title: "Coin Flip",
          description: interaction.getString("fun.COMMAND_COIN_DESCRIPTION", { coin }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }

  public async runWithMessage(message: Message) {
    const coin = Math.random() < 0.5 ? "heads" : "tails";

    await message.channel.send({
      embeds: [
        {
          title: "Coin Flip",
          description: message.getString("fun.COMMAND_COIN_DESCRIPTION", { coin }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
