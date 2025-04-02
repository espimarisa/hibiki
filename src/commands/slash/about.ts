/**
 * @file Command that returns information and statistics about the bot.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/about
 */

import { CommandColors, commands, createCommand } from "@/utils/command.js";
import { env } from "@/utils/env.js";
import { getTimeSince } from "@/utils/format.js";
import { t, tObj } from "@/utils/i18n.js";
import { localizeTime } from "@/utils/localize.js";
import { ApplicationCommandType } from "discord.js";

const startupTimestamp = new Date();

export const aboutCommand = createCommand({
	name: t("command:COMMAND_ABOUT_NAME"),
	description: t("command:COMMAND_ABOUT_DESCRIPTION"),
	name_localizations: tObj("command:COMMAND_ABOUT_NAME"),
	description_localizations: tObj("command:COMMAND_ABOUT_DESCRIPTION"),
	type: ApplicationCommandType.ChatInput,

	async runSlashCommand(interaction) {
		// Calculates uptime
		const uptime = getTimeSince(startupTimestamp, new Date());
		const localizedUptime = localizeTime(uptime, interaction.locale);

		// Sends the embed
		await interaction.reply({
			embeds: [
				{
					title: t("command:COMMAND_ABOUT_TITLE", {
						lng: interaction.locale,
						username: interaction.client.user.username,
					}),
					description: t("command:COMMAND_ABOUT_DETAILS", {
						lng: interaction.locale,
						username: interaction.client.user.username,
					}),
					color: CommandColors.Primary,
					thumbnail: {
						url: interaction.client.user.displayAvatarURL(),
					},
					fields: [
						{
							name: t("command:COMMAND_ABOUT_UPTIME", {
								lng: interaction.locale,
							}),
							value: localizedUptime,
							inline: false,
						},
						{
							name: t("command:COMMAND_ABOUT_VERSION", {
								lng: interaction.locale,
							}),
							value: env.npm_package_version,
							inline: true,
						},
						{
							name: t("command:COMMAND_ABOUT_BUN", {
								lng: interaction.locale,
							}),
							value: Bun.version,
							inline: true,
						},
						{
							name: t("command:COMMAND_ABOUT_REGISTEREDCOMMANDS", {
								lng: interaction.locale,
							}),
							value: commands.size.toString(),
							inline: false,
						},
					],
				},
			],
		});
	},
});
