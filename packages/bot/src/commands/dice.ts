import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

export class DiceCommand extends HibikiCommand {
  options = [
    {
      // The amount of sides that should be on the dice
      type: ApplicationCommandOptionType.Integer,
      required: false,
      min_value: 1,
      max_value: 120,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the number of sides and rolls the die
    const sides = interaction.options.getInteger((this.options as APIOption[])[0]!.name) || 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    await interaction.followUp({
      embeds: [
        {
          title: t("commands:COMMAND_DICE_DICE", { lng: interaction.locale }),
          description: t("commands:COMMAND_DICE_DICE_RESULT", {
            sides: sides,
            roll: roll,
            lng: interaction.locale,
          }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
