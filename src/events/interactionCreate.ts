/**
 * @file Event listener for interactionCreate; handles running interactions.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { captureError, parseError, sendErrorReply } from "@/utils/error.js";
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

  // Gets the user and guild name/ID
  const user = `${interaction.user.username} (${interaction.user.id})`;
  const guild = interaction.guild
    ? `${interaction.guild.name} (${interaction.guild.id})`
    : "DMs";

  /**
   * Slash command handler
   */

  if (interaction.isChatInputCommand()) {
    const command = commandToRun as HibikiSlashCommand;
    const commandName = command.data.name;

    try {
      // Defer replies for deferred commands
      if (command.defer) {
        await interaction.deferReply({
          // Handle ephemeral flags
          flags: command.ephemeral ? "Ephemeral" : [],
        });
      }

      // Runs the command and logs it
      await command.runCommand(interaction);
      logger.info(`${user} ran command ${commandName} in ${guild}`);
    } catch (err) {
      const error = parseError(err);
      logger.error(`Error running command ${commandName}: ${error.message}`);

      // Sends an error reply
      await sendErrorReply(
        interaction,
        "errors:ERROR_STACK",
        command.defer,
        command.ephemeral,
        {
          error: error.message,
        },
      );

      // Captures the error with sentry
      captureError(err, {
        command: commandName,
        guild: guild,
        user: user,
      });
    }

    return;
  }
}
