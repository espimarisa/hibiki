import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { HibikiColors } from "$shared/constants.js";
import { t } from "$shared/i18n.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export class DiceCommand extends HibikiCommand {
  description = "Rolls an x-sided die (defaults to 6; maximum is 120).";

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

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets the number of sides and rolls the die
    const sides = (interaction.options.data[0]?.value as number | undefined) ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;

    await interaction.followUp({
      embeds: [
        {
          title: t("COMMAND_DICE_TITLE", { lng: interaction.lng }),
          description: t("COMMAND_DICE_DESCRIPTION", { result: result, sides: sides, lng: interaction.lng }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
