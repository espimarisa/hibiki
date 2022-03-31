import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class DiceCommand extends HibikiCommand {
  description = "Rolls an x sided die (defaults to 6; maximum is 120).";

  options: ApplicationCommandOptionData[] = [
    {
      name: "sides",
      type: "INTEGER",
      required: false,
      description: "The number of sides on the die.",
      minValue: 1,
      maxValue: 120,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    const sides = interaction.options.getInteger("sides") || 6;

    const roll = Math.floor(Math.random() * sides) + 1;

    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("fun.COMMAND_DICE_TITLE"),
          description: interaction.getString("fun.COMMAND_DICE_DESCRIPTION", { roll, sides }),
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
