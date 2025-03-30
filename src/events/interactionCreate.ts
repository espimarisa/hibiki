/**
 * @file Event handler for the interactionCreate event.
 * @author Espi Marisa <contact@espi.me>
 * @module events/interactionCreate
 */

import { HIBIKI_COMMANDS } from "@/utils/command.js";
import { createEvent } from "@/utils/event.js";
import { commandLogger } from "@/utils/logger.js";
import type { ChatInputCommandInteraction } from "discord.js";

createEvent({
	event: "interactionCreate",
	once: false,

	async runEvent(interaction: ChatInputCommandInteraction) {
		// Only run interaction commands; ignore empty data
		if (!(interaction?.commandName && interaction.isCommand())) {
			return;
		}

		// Searches for the right command to run
		const command = HIBIKI_COMMANDS.get(interaction.commandName);
		if (!command) {
			return;
		}

		// Logs when a command is ran
		const guildName = interaction.guild ? interaction.guild.name : "DMs";
		const guildID = interaction.guild ? interaction.guild.id : "DMs";
		commandLogger.info(
			`${interaction.commandName} ran in ${guildName} (${guildID}) by ${interaction.user.tag} (${interaction.user.id})`,
		);

		try {
			// Defers the reply if needed
			if (command.defer) {
				await interaction.deferReply({
					flags: command.ephemeral ? ["Ephemeral"] : [],
				});
			}

			// Runs the command
			await command.runCommand(interaction);
		} catch (error) {
			commandLogger.error(`Error while running ${command.name}:`);
			throw new Error(Bun.inspect(error));
		}
	},
});
