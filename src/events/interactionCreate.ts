/**
 * @file Event listener for interactionCreate.
 * @license Zlib
 */

import type { HibikiEvent } from "@/helpers/event.ts";
import { captureError, parseError, sendErrorReply } from "@/utils/error.ts";
import { clientLog, commandLog } from "@/utils/logger.ts";
import type { CommandInteraction } from "discord.js";
import { getGuildString, getUserString } from "../helpers/discord.ts";

export const interactionCreate: HibikiEvent<"interactionCreate"> = {
  event: "interactionCreate",

  async handle(interaction) {
    const guildString = interaction.guild
      ? getGuildString(interaction.guild)
      : "DMs";

    clientLog.debug(
      `Received interaction ${interaction.id} in ${guildString}.`,
    );

    // Runs command interactions.
    if (interaction.isCommand()) {
      clientLog.debug(
        `Received command interaction ${interaction.commandName} in ${guildString}.`,
      );

      // Runs the command on the interaction.
      await runCommand(interaction);
    } else {
      clientLog.warn(`No handler for interaction type ${interaction.type}.`);
      return;
    }
  },
};

/**
 * Runs a command.
 * @param interaction The interaction to run the command on.
 */

async function runCommand(interaction: CommandInteraction) {
  // Finds the command to run.
  const command = interaction.client.commands.get(interaction.commandName);

  // Do not run invalid commands.
  if (!command) {
    commandLog.warn(`No command for interaction ${interaction.commandName}.`);
    return;
  }

  // Gets the user/guild name and ID to log.
  const userString = getUserString(interaction.user);
  const guildString = interaction.guild
    ? getGuildString(interaction.guild)
    : "DMs";

  // Slash command handler.
  if (interaction.isChatInputCommand()) {
    try {
      // Runs the command and logs it.
      await command.run(interaction);
      commandLog.info(
        `${userString} ran ${command.data.name} in ${guildString}.`,
      );
    } catch (err) {
      const error = parseError(err);
      commandLog.error(
        `Error running command ${command.data.name}: ${error.message}`,
      );

      // Captures the Error with Sentry.
      captureError(err, {
        command: command.data.name,
        guild: guildString,
        user: userString,
      });

      // Sends an error reply.
      await sendErrorReply(
        interaction,
        "errors:ERROR_STACK",
        interaction.deferred,
        interaction.ephemeral ?? false,
        {
          error: error.message,
        },
      ).catch(() => {
        commandLog.warn(`Failed to send error reply in ${guildString}.`);
        return;
      });
    }
  }
}
