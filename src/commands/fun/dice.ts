import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

export class DiceCommand extends HibikiCommand {
  description = "Rolls an x sided die (defaults to 6; maximum is 120).";

  options: APIApplicationCommandOption[] = [
    {
      name: "sides",
      type: ApplicationCommandOptionType.Number,
      required: false,
      description: "The number of sides on the die.",
      min_value: 1,
      max_value: 120,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets the number of sides
    const sides = interaction.options.getInteger(this.options[0].name) || 6;

    // Rolls the die
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
