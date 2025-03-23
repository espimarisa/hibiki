/**
 * @file ping
 * @description Command for checking Hibiki's current latency.
 * @author Espi Marisa <contact@espi.me>
 */

import { i18xs } from "$root/utils/i18nxs.ts";
import { HibikiColors } from "$utils/constants.ts";
import { createHibikiCommand, setCommandName } from "$utils/loader.ts";
import { createEmbeds, snowflakeToTimestamp } from "@discordeno/bot";
import { ApplicationCommandTypes } from "@discordeno/types";

createHibikiCommand({
	name: setCommandName(import.meta.file),
	description: i18xs.t("commands.COMMAND_PING_DESCRIPTION"),
	type: ApplicationCommandTypes.ChatInput,

	/**
	 * Runs the ping command.
	 * @param interaction The interaction to run the command on.
	 */

	async runCommand(interaction) {
		// Calculates the current latency
		const ping = Date.now() - snowflakeToTimestamp(interaction.id);

		// Creates the embed
		const embeds = createEmbeds()
			.setTitle(i18xs.t("commands.COMMAND_PING_TITLE"))
			.setDescription(i18xs.t("commands.COMMAND_PING_LATENCY", { ping: ping }))
			.setColor(HibikiColors.GENERAL);

		// Sends the embed
		await interaction.respond({
			embeds,
		});
	},
});
