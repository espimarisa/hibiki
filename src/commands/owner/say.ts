import type { CommandInteraction, TextBasedChannel } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

export class SayCommand extends HibikiCommand {
  description = "Says something.";
  messageOnly = true;
  ownerOnly = true;

  options: APIApplicationCommandOption[] = [
    {
      name: "text",
      type: ApplicationCommandOptionType.String,
      required: true,
      description: "The text to say.",
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    await (interaction.channel as TextBasedChannel).send({
      content: interaction.options.getString(this.options[0].name),
    });
  }
}
