import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import { ApplicationCommandOptionType, type APIApplicationCommandOption } from "discord-api-types/v9";

export class OwoifyCommand extends HibikiCommand {
  description = "OwOifys some text.";

  options: APIApplicationCommandOption[] = [
    {
      name: "text",
      type: ApplicationCommandOptionType.String,
      required: true,
      description: "The text to owoify.",
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    const text = <string>interaction.options.getString("text");

    // honest to god I have no idea if this even works and im too lazy to test it
    // lets just hope it fucks up their speech at least
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
