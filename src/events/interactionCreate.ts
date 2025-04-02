/**
 * @file Event handler for the interactionCreate event.
 * @author Espi Marisa <contact@espi.me>
 * @module events/interactionCreate
 */

import { commands, runCommand } from "@/utils/command.js";
import { errorReply, getError } from "@/utils/error.js";
import { createEvent } from "@/utils/event.js";
import { logger } from "@/utils/logger.js";
import type { Interaction } from "discord.js";

createEvent({
	event: "interactionCreate",
	once: false,

	async runEvent(interaction: Interaction) {
		// Only handle commands
		// TODO: Handle other interactions seperately
		if (!interaction.isCommand()) {
			return;
		}

		// Searches for the command to run
		const command = commands.get(interaction.commandName);
		if (!command) {
			return;
		}

		// Logs when a command is run
		logger.info(
			`${interaction.commandName} ran in ${
				interaction.guild?.name ?? "DMs"
			} by ${interaction.user.tag} (${interaction.user.id})`,
		);

		// Runs the specific command type
		try {
			await runCommand(interaction, command);
		} catch (err) {
			// Log the error and send the simplified message
			const error = getError(err);
			logger.error(`Error while running command: ${error.cause}`);
			await errorReply(interaction, "error:ERROR_STACK", command.defer, {
				"error": error.message,
			});
		}
	},
});
