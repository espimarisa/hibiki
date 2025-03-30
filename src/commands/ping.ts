/**
 * @file Command to check the current latency and shard status.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/ping
 */

import { CommandColors, createCommand, getFileName } from "@/utils/command.js";
import { t } from "@/utils/i18n.js";
import { EmbedBuilder, SnowflakeUtil } from "discord.js";

createCommand({
	name: getFileName(import.meta.file),
	description: t("commands:COMMAND_PING_DESCRIPTION"),
	userInstallable: true,

	async runCommand(interaction) {
		// Calculates the current latency and shard latency
		const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
		const shardID = interaction.guild?.shardId || 0;
		const shardLatency = interaction.client.ws.shards.get(shardID)?.ping || 0;

		// Generates the embed
		const embeds = new EmbedBuilder()
			.setTitle(t("commands:COMMAND_PING_PONG", { lng: interaction.locale }))
			.setDescription(
				t("commands:COMMAND_PING_LATENCY", {
					lng: interaction.locale,
					ping: ping,
					latency: shardLatency,
				}),
			)
			.setColor(CommandColors.PRIMARY);

		// Sends the message
		await interaction.followUp({ embeds: [embeds] });
	},
});
