/**
 * @file Utilities for creating and registering a Hibiki command.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/command
 */

import {
	type ApplicationCommandType,
	Collection,
	type CommandInteraction,
} from "discord.js";

// Creates a collection of commands
export const HIBIKI_COMMANDS = new Collection<string, HibikiCommand>();

export interface HibikiCommand {
	name: string;
	description: string;
	type: ApplicationCommandType;
	ephemeral?: boolean;

	/**
	 * Runs a Hibiki command via a Discord interaction.
	 * @param interaction The interaction to run the command on.
	 */

	runCommand: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * Registers a Hibiki command into the collection.
 * @param command The command to add to the collection.
 */

export function createHibikiCommand(command: HibikiCommand) {
	HIBIKI_COMMANDS.set(command.name, command);
}
