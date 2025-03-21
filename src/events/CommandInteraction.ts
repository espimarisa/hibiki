/**
 * @file CommandInteraction
 * @description Event listener for slash commands
 * @author Espi Marisa <contact@espi.me>
 */

import { HibikiEvent, type HibikiEventListener } from "$classes/HibikiEvent.ts";

import type {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";

// Possible command interaction types
export type PossibleCommandInteractionType =
	| ChatInputCommandInteraction
	| ContextMenuCommandInteraction
	| UserContextMenuCommandInteraction;

export class CommandInteractionEvent extends HibikiEvent {
	events: HibikiEventListener[] = ["interactionCreate"];

	/**
	 * Runs the CommandInteractionEvent command handler
	 * @param _event The events to listen on (inferred)
	 * @param interaction The interaction to handle
	 */

	async run(
		_event: HibikiEventListener[],
		interaction: PossibleCommandInteractionType,
	) {
		// Only run on commands
		if (!(interaction.commandName && interaction.isCommand())) {
			return;
		}

		await interaction.deferReply();
	}
}
