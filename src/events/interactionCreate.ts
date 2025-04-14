/**
 * @file Event listener for interactionCreate; handles running interactions.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { parseError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { CommandInteraction, Interaction } from "discord.js";

export const interactionCreate: HibikiEvent<"interactionCreate"> = {
  event: "interactionCreate",
  once: false,

  async runEvent(interaction: Interaction) {
    // Only handle supported interaction types
    if (!(interaction.isButton() || interaction.isCommand())) {
      return;
    }

    if (interaction.isCommand()) {
      await runCommand(interaction);
    }
  },
};

/**
 * Runs a command.
 * @param interaction The interaction to run the slash command on.
 */

async function runCommand(interaction: CommandInteraction) {
  // Finds the command to run
  const commandToRun = interaction.client.commands?.get(
    interaction.commandName,
  );

  // Do not run invalid commands
  if (!commandToRun) {
    logger.warn(`No command found for ${interaction.commandName}`);
    return;
  }

  /**
   * Slash command handler
   */

  if (interaction.isChatInputCommand()) {
    const command = commandToRun as HibikiSlashCommand;

    try {
      // Defer replies for deferred commands
      if (command.defer) {
        await interaction.deferReply({
          flags: command.ephemeral ? "Ephemeral" : [],
        });
      }

      // Runs the command
      await command.runCommand(interaction);
    } catch (err) {
      const error = parseError(err);
      logger.error(
        `Error running slash command ${command.data.name}: ${error.message}`,
      );
    }

    return;
  }
}
