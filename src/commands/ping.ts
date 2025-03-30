/**
 * @file Command to check the current latency and shard status.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/ping
 */

import { CommandColors, createCommand, getFileName } from "@/utils/command.js";
import { t, tList } from "@/utils/i18n.js";
import { SnowflakeUtil } from "discord.js";

createCommand({
	name: getFileName(import.meta.file),
	description: t("commands:COMMAND_PING_DESCRIPTION"),
	name_localizations: tList("commands:COMMAND_PING_NAME", true),
	description_localizations: tList("commands:COMMAND_PING_DESCRIPTION"),

	async runCommand(interaction) {
		// Calculates the current latency and shard latency
		const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
		const shardID = interaction.guild?.shardId || 0;
		const shardLatency = interaction.client.ws.shards.get(shardID)?.ping || 0;

		// Sends the message
		await interaction.reply({
			embeds: [
				{
					title: t("commands:COMMAND_PING_PONG", { lng: interaction.locale }),
					description: t("commands:COMMAND_PING_LATENCY", {
						lng: interaction.locale,
						ping: ping,
						latency: shardLatency,
					}),
					color: CommandColors.PRIMARY,
				},
			],
		});
	},
});
