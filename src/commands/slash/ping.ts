/**
 * @file Command to check the current latency and shard status.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/ping
 */

import { CommandColors, createCommand } from "@/utils/command.js";
import { t, tObj } from "@/utils/i18n.js";
import { ApplicationCommandType, SnowflakeUtil } from "discord.js";

export const pingCommand = createCommand({
	name: t("command:COMMAND_PING_NAME"),
	description: t("command:COMMAND_PING_DESCRIPTION"),
	name_localizations: tObj("command:COMMAND_PING_NAME"),
	description_localizations: tObj("command:COMMAND_PING_DESCRIPTION"),
	type: ApplicationCommandType.ChatInput,

	async runSlashCommand(interaction) {
		// Calculates the current latency and shard latency
		const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
		const shardId = interaction.guild?.shardId || 0;
		const shardLatency = interaction.client.ws.shards.get(shardId)?.ping || 0;

		// Sends the message
		await interaction.reply({
			embeds: [
				{
					title: t("command:COMMAND_PING_PONG", { lng: interaction.locale }),
					description: t("command:COMMAND_PING_LATENCY", {
						lng: interaction.locale,
						ping: ping,
						latency: shardLatency,
					}),
					color: CommandColors.Secondary,
				},
			],
		});
	},
});
