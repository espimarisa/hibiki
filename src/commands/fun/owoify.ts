import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class OwoifyCommand extends HibikiCommand {
  description = "OwOify a message.";

  options: ApplicationCommandOptionData[] = [
    {
      name: "text",
      type: "STRING",
      required: true,
      description: "The text to owoify.",
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    const text = <string>interaction.options.getString("text");

    const owoified = text
      .replace(/r/g, "w")
      .replace(/R/g, "W")
      .replace(/l/g, "w")
      .replace(/L/g, "W")
      .replace(/n/g, "ny")
      .replace(/N/g, "Ny")
      .replace(/\s/g, " owo ");

    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("fun.COMMAND_OWOIFY_TITLE"),
          description: owoified,
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
