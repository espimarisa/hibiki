/**
 * @file Event handler listening for interactionCreate and to run slash commands.
 * @author Espi Marisa <contact@espi.me>
 * @module handlers/slashCommands
 */

import { getError, sendErrorReply } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";

export const slashCommandHandler: HibikiEventHandler<"interactionCreate"> = {
  "event": "interactionCreate",
  "once": false,

  async runHandler(interaction) {
    // Only handle slash commands with this handler
    if (!(interaction.isCommand() && interaction?.isChatInputCommand())) {
      return;
    }

    // Finds the command to run; returns if no command is found
    const command = interaction.client.slashCommands?.get(
      interaction.commandName,
    );

    if (!command) {
      logger.warn(
        `No command found for interaction ${interaction.commandName}`,
      );

      return;
    }

    // Runs the slash command
    try {
      // Defers the initial reply if comamnd.defer is set
      if (command.defer) {
        // Defers the reply; use Ephemeral if needed
        await interaction.deferReply({
          "flags": command.ephemeral ? ["Ephemeral"] : [],
        });
      }
      await command.runCommand(interaction);
    } catch (err) {
      const error = getError(err);
      logger.error(`Error running ${command.data.name}: ${error.stack}`);

      // Sends an error reply with error.message
      await sendErrorReply(
        interaction,
        "error:STACK",
        command.defer,
        command.ephemeral,
        {
          error: error.message,
        },
      );

      return;
    }
  },
};
