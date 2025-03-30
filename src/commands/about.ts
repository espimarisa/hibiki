/**
 * @file Command that returns information and statistics about the bot.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/about
 */

import {
	CommandColors,
	createCommand,
	getFileName,
	HIBIKI_COMMANDS,
} from "@/utils/command.js";
import { env } from "@/utils/env.js";
import { getTimeSince } from "@/utils/format.js";
import { t, tList } from "@/utils/i18n.js";
import { localizeTime } from "@/utils/localize.js";

const startupTimestamp = new Date();

createCommand({
	name: getFileName(import.meta.file),
	description: t("commands:COMMAND_ABOUT_DESCRIPTION"),
	name_localizations: tList("commands:COMMAND_ABOUT_NAME", true),
	description_localizations: tList("commands:COMMAND_ABOUT_DESCRIPTION"),

	async runCommand(interaction) {
		// Calculates uptime
		const uptime = getTimeSince(startupTimestamp, new Date());
		const localizedUptime = localizeTime(uptime, interaction.locale);

		// Sends the embed
		await interaction.reply({
			embeds: [
				{
					title: t("commands:COMMAND_ABOUT_TITLE", {
						lng: interaction.locale,
						username: interaction.client.user.username,
					}),
					description: t("commands:COMMAND_ABOUT_DETAILS", {
						lng: interaction.locale,
						username: interaction.client.user.username,
					}),
					color: CommandColors.PRIMARY,
					thumbnail: {
						url: interaction.client.user.displayAvatarURL(),
					},
					fields: [
						{
							name: t("commands:COMMAND_ABOUT_UPTIME", {
								lng: interaction.locale,
							}),
							value: localizedUptime,
							inline: false,
						},
						{
							name: t("commands:COMMAND_ABOUT_VERSION", {
								lng: interaction.locale,
							}),
							value: env.npm_package_version,
							inline: true,
						},
						{
							name: t("commands:COMMAND_ABOUT_BUN", {
								lng: interaction.locale,
							}),
							value: Bun.version,
							inline: true,
						},
						{
							name: t("commands:COMMAND_ABOUT_REGISTEREDCOMMANDS", {
								lng: interaction.locale,
							}),
							value: HIBIKI_COMMANDS.size.toString(),
							inline: false,
						},
					],
				},
			],
		});
	},
});
