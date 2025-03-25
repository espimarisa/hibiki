/**
 * @file ping
 * @description Command for checking Hibiki's current latency.
 * @author Espi Marisa <contact@espi.me>
 */

import { HibikiColors } from "$utils/constants.ts";
import { t } from "$utils/i18n.ts";
import { createHibikiCommand, setCommandName } from "$utils/loader.ts";
import { createEmbeds, snowflakeToTimestamp } from "@discordeno/bot";
import { ApplicationCommandTypes } from "@discordeno/types";

createHibikiCommand({
	name: setCommandName(import.meta.file),
	description: t("commands:COMMAND_PING_DESCRIPTION", { lng: "en" }),
	type: ApplicationCommandTypes.ChatInput,
	options: [],

	/**
	 * Runs the ping command.
	 * @param interaction The interaction to run the command on.
	 */

	async runCommand(interaction) {
		// Calculates the current latency
		const ping = Date.now() - snowflakeToTimestamp(interaction.id);

		// Creates the embed
		const embeds = createEmbeds()
			.setTitle(
				t("commands:COMMAND_PING_TITLE", {
					lng: interaction.locale ?? "en",
				}),
			)
			.setDescription(
				t("commands:COMMAND_PING_LATENCY", {
					ping: ping,
					lng: interaction.locale ?? "en",
				}),
			)
			.setColor(HibikiColors.GENERAL);

		// Sends the embed
		await interaction.respond({
			embeds,
		});
	},
});
