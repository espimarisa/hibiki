/**
 * @file Event handler for interactionCreate.
 * @license zlib
 */

import { getGuildString, getUserString } from "@/utils/format.ts";
import { clientLog, commandLog } from "@/utils/logger.ts";
import { captureException } from "@sentry/bun";
import type { CommandInteraction } from "discord.js";

export const interactionCreate = {
  event: "interactionCreate",

  handle: async (interaction) => {
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
} satisfies HibikiListener<"interactionCreate">;

/**
 * Runs a command.
 * @param interaction The interaction to run the command on.
 */

async function runCommand(interaction: CommandInteraction) {
  // Finds the command to run.
  const command = interaction.client.chatCommands.get(interaction.commandName);

  // Do not run invalid commands.
  if (!command) {
    commandLog.warn(`No command found for ${interaction.commandName}.`);
    return;
  }

  // Gets the user/guild name and ID to log.
  const userString = getUserString(interaction.user);
  const guildString = interaction.guild
    ? getGuildString(interaction.guild)
    : "DMs";

  /**
   * Slash (chat input) command handler.
   */

  if (interaction.isChatInputCommand()) {
    try {
      // Runs the command and logs it.
      await command.run(interaction);
      commandLog.info(
        `${userString} ran ${interaction.commandName} in ${guildString}.`,
      );
    } catch (err) {
      commandLog.error(err, `Error running command ${command.data.name}.`);
      captureException(err, {
        extra: {
          command: command.data.name,
          guildID: interaction.guild?.id || "DMs",
          userID: interaction.user.id,
        },
      });
    }
  }
}
