import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

// Paramaters to remove from setting in files (these are handled by our loader)
export class DiceCommand extends HibikiCommand {
  options = [
    {
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
          title: t("DICE", { lng: interaction.locale, ns: "commands" }),
          description: t("DICE_RESULT", { sides: sides, roll: roll, lng: interaction.locale, ns: "commands" }),
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}
