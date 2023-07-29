import type { CommandInteraction } from "discord.js";
import { HibikiEvent } from "../classes/Event.js";
import { HibikiColors } from "$shared/constants.js";
import util from "node:util";

export class HibikiInteractionEvent extends HibikiEvent {
  events: HibikiEventListener[] = ["interactionCreate"];

  public async run(_event: HibikiEventListener[], interaction: CommandInteraction) {
    // Don't run any interactions that aren't commands or that don't actually exist
    if (!interaction?.commandName) return;

    // Searches for the right command to run
    const command = this.bot.commands.get(interaction.commandName);
    if (!command) return;

    try {
      // Defers the command for a followup. If ephemeral is set, set the flag
      await interaction.deferReply({ ephemeral: command.ephemeral });

      // Runs the command
      await command.runWithInteraction?.(interaction);
    } catch (error) {
      await interaction.followUp({
        embeds: [
          {
            // TODO: Localise
            title: `❌ Error while running ${command.name}`,
            description: "```TS\n" + `${(error as Error).stack}` + "```",
            color: HibikiColors.ERROR,
            footer: {
              // TODO: Localise
              text: "Found a bug? - https://github.com/espimarisa/hibiki/issues",
            },
          },
        ],
      });

      throw new Error(util.inspect(error));
    }
  }
}
