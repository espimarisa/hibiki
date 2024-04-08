import { HibikiCommand } from "$classes/Command";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import {
  type APIApplicationCommandOption,
  ApplicationCommandOptionType,
  type ChatInputCommandInteraction,
} from "discord.js";

// Paramaters to remove from setting in files (these are handled by our loader)
export class DiceCommand extends HibikiCommand {
  options: APIApplicationCommandOption[] = [
    // @ts-expect-error This will be fixed later; it's handled by the linter loader
    {
      type: ApplicationCommandOptionType.Integer,
      required: false,
      min_value: 1,
      max_value: 120,
    },
  ];

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets the number of sides and rolls the die
    const sides = interaction.options.getInteger(this.options[0]?.name as string) || 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_DICE_DICE", { lng: interaction.locale }),
          description: t("COMMAND_DICE_RESULT", { sides: sides, roll: roll, lng: interaction.locale }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
