/**
 * @file ping
 * @description Command for checking Hibiki's current latency.
 * @author Espi Marisa <contact@espi.me>
 */

import { createHibikiCommand } from "$utils/loader.ts";
import { ApplicationCommandTypes } from "@discordeno/types";

createHibikiCommand({
	name: "ping",
	description: "check latency bla bla this is a test",
	type: ApplicationCommandTypes.ChatInput,

	/**
	 * Runs the ping command.
	 * @param interaction The interaction to run the command on.
	 */

	async runCommand(interaction) {
		await interaction.respond("hi from discordeno");
	},
});
