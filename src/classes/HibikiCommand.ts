/**
 * @file HibikiCommand
 * @description Class used to create and run Hibiki commands
 * @author Espi Marisa <contact@espi.me>
 */

import type { HibikiClient } from "$classes/HibikiClient.ts";

export abstract class HibikiCommand {
	description?: string;

	/**
	 * Creates a new Hibiki command
	 * @param bot The bot client to attach to the command
	 * @param name The command name (filename)
	 */

	protected constructor(
		public bot: HibikiClient,
		public name: string,
	) {}

	/**
	 * Runs a command
	 * @param interaction The type of interaction to run the command with
	 */

	abstract runCommand(interaction: unknown): Promise<void>;
}
