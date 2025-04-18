/**
 * @file Event listener for interactionCreate.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { captureError, parseError, sendErrorReply } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import type { CommandInteraction, Interaction } from "discord.js";

export const interactionCreate: HibikiListener<"interactionCreate"> = {
  event: "interactionCreate",
  once: false,

  async runListener(interaction: Interaction) {
    // Only process supported interaction types
    if (!(interaction.isButton() || interaction.isCommand())) {
      return;
    }

    // Runs interaction application command interactions
    if (interaction.isCommand()) {
      await runCommand(interaction);
    }
  },
};

/**
 * Runs an interaction command.
 * @param interaction The interaction to run the command on.
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

  // Gets the user/guild name and ID to log
  const user = `${interaction.user.username} (${interaction.user.id})`;
  const guild = interaction.guild
    ? `${interaction.guild.name} (${interaction.guild.id})`
    : "DMs";

  // Slash (chat input) command handler
  if (interaction.isChatInputCommand()) {
    const command = commandToRun as HibikiChatCommandInteraction;
    const commandName = command.data.name;

    try {
      // Defer replies for deferred commands
      if (command.defer) {
        await interaction.deferReply({
          // Handle ephemeral flags
          flags: command.ephemeral ? "Ephemeral" : [],
        });
      }

      // Runs the command
      await command.runCommand(interaction);
      logger.info(`${user} ran command interaction ${commandName} in ${guild}`);
    } catch (err) {
      const error = parseError(err);
      logger.error(
        `Error running command interaction ${commandName}: ${error.message}`,
      );

      // Captures the Error with Sentry
      captureError(err, {
        command: commandName,
        guild: guild,
        user: user,
      });

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
    }
  }
}
