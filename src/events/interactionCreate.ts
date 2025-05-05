/**
 * @file Event listener for interactionCreate.
 * @license Zlib
 */

import type { HibikiEvent } from "@/helpers/event.ts";
import { captureError, parseError, sendErrorReply } from "@/utils/error.ts";
import { logger } from "@/utils/logger.ts";
import type { CommandInteraction } from "discord.js";
import type { HibikiCommand } from "../helpers/command.ts";

export const interactionCreate: HibikiEvent<"interactionCreate"> = {
  event: "interactionCreate",

  async handle(interaction) {
    // Only process supported interaction types.
    if (!(interaction.isButton() || interaction.isCommand())) {
      return;
    }

    // Runs command interactions.
    if (interaction.isCommand()) {
      await runCommand(interaction);
    }
  },
};

/**
 * Runs a command.
 * @param interaction The interaction to run the command on.
 */

async function runCommand(interaction: CommandInteraction) {
  // Finds the command to run.
  const commandToRun = interaction.client.commands.get(interaction.commandName);

  // Do not run invalid commands.
  if (!commandToRun) {
    logger.warn(`No command found for ${interaction.commandName}`);
    return;
  }

  // Gets the user/guild name and ID to log.
  const user = `${interaction.user.username} (${interaction.user.id})`;
  const guild = interaction.guild
    ? `${interaction.guild.name} (${interaction.guild.id})`
    : "DMs";

  // Slash command handler.
  if (interaction.isChatInputCommand()) {
    const command = commandToRun as HibikiCommand;
    const commandName = command.data.name;

    try {
      // Runs the command.
      await command.run(interaction);
      logger.info(`${user} ran slash command ${commandName} in ${guild}`);
    } catch (err) {
      const error = parseError(err);
      logger.error(`Error running command ${commandName}: ${error.message}`);

      // Captures the Error with Sentry.
      captureError(err, {
        command: commandName,
        guild: guild,
        user: user,
      });

      // Sends an error reply.
      await sendErrorReply(
        interaction,
        "errors:ERROR_STACK",
        interaction.deferred ?? false,
        interaction.ephemeral ?? false,
        {
          error: error.message,
        },
      ).catch(() => {
        logger.warn(`Failed to send error reply in ${guild}`);
        return;
      });
    }
  }
}
