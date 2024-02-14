import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "$classes/Command.ts";

export class HibikiTestCommand extends HibikiCommand {
  description = "This is a test.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    await interaction.followUp({
      embeds: [
        {
          title: "Testing OwO",
        },
      ],
    });
  }
}
