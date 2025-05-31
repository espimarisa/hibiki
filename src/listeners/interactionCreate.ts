/**
 * @file Event handler for interactionCreate.
 * @license zlib
 */

import { captureException } from "@sentry/bun";
import type { CommandInteraction } from "discord.js";
import { getGuildString, getUserString } from "@/utils/format.ts";
import { clientLog, commandLog } from "@/utils/logger.ts";

export const interactionCreate: HibikiListener<"interactionCreate"> = {
  event: "interactionCreate",

  handle: async (interaction) => {
    const guildString = interaction.guild
      ? getGuildString(interaction.guild)
      : "DMs";

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
    commandLog.warn(`No command found for ${interaction.commandName}.`);
    return;
  }

  // Gets the user/guild name and ID to log.
  const userString = getUserString(interaction.user);
  const guildString = interaction.guild
    ? getGuildString(interaction.guild)
    : "DMs";

  /**
   * Chat input command handler.
   */

  if (interaction.isChatInputCommand()) {
    try {
      // Runs the command and logs it.
      await command.run(interaction);
      commandLog.info(
        `${userString} ran ${interaction.commandName} in ${guildString}.`,
      );
    } catch (err) {
      commandLog.error(err, `Error running ${interaction.commandName}.`);
      captureException(err, {
        extra: {
          command: interaction.commandName,
          guildID: interaction.guild?.id || "DMs",
          userID: interaction.user.id,
        },
      });
    }
  }
}
