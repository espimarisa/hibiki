import { HibikiEvent } from "$classes/Event.ts";
import { getUserConfig } from "$db/index.ts";
import { env } from "$shared/env.ts";
import { logger } from "$shared/logger.ts";
import type { HibikiEventListener } from "$typings/index.d.ts";
import type { CommandInteraction } from "discord.js";

export class HibikiInteractionEvent extends HibikiEvent {
  locale?: string;
  events: HibikiEventListener[] = ["interactionCreate"];

  async run(_event: HibikiEventListener[], interaction: CommandInteraction) {
    // Don't run any interactions that aren't commands or that don't actually exist
    if (!interaction.commandName) {
      return;
    }

    // Searches for the right command to run
    const command = this.bot.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    // Gets the user's locale and appends it to the class
    // TODO: Caching
    const userConfig = await getUserConfig(interaction.user.id);
    this.locale = userConfig?.locale ?? env.DEFAULT_LOCALE;

    // Logs when an interaction is ran
    // TODO: Implement arguments
    logger.info(
      `${interaction.user.tag}/${interaction.user.id} ran ${interaction.commandName} in ${
        interaction.guild?.name ?? "unknown"
      }/${interaction.guild?.id ?? "unknown"}`,
    );

    try {
      // Defers the command for a followup. If ephemeral is set, set the flag
      await interaction.deferReply({ ephemeral: command.ephemeral });

      // Runs the command
      await command.runWithInteraction?.(interaction);
    } catch (error) {
      await interaction.followUp({
        embeds: [
          {
            title: "Error :(",
          },
        ],
      });

      throw new Error(Bun.inspect(error));
    }
  }
}
