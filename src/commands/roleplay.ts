/**
 * @file Command for user-to-user roleplay and interaction.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/roleplay
 */

import { CommandColors, createCommand, getFileName } from "@/utils/command.js";
import { sendErrorReply } from "@/utils/error.js";
import { t, tList } from "@/utils/i18n.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

createCommand({
	name: getFileName(import.meta.file),
	name_localizations: tList("commands:COMMAND_ROLEPLAY_NAME", true),
	description: t("commands:COMMAND_ROLEPLAY_DESCRIPTION"),
	description_localizations: tList("commands:COMMAND_ROLEPLAY_DESCRIPTION"),
	options: [
		{
			// Hug subcommand
			name: t("commands:COMMAND_ROLEPLAY_HUG").toLowerCase(),
			description: t("commands:COMMAND_ROLEPLAY_HUG_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to hug
					name: t("common:MEMBER").toLowerCase(),
					name_localizations: tList("common:MEMBER", true),
					description: t("commands:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tList("commands:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			// Kiss subcommand
			name: t("commands:COMMAND_ROLEPLAY_KISS").toLowerCase(),
			description: t("commands:COMMAND_ROLEPLAY_KISS_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to kiss
					name: t("common:MEMBER").toLowerCase(),
					name_localizations: tList("common:MEMBER", true),
					description: t("commands:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tList("commands:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			// Cuddle subcommand
			name: t("commands:COMMAND_ROLEPLAY_CUDDLE").toLowerCase(),
			description: t("commands:COMMAND_ROLEPLAY_CUDDLE_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to cuddle
					name: t("common:MEMBER").toLowerCase(),
					name_localizations: tList("common:MEMBER", true),
					description: t("commands:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tList("commands:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			// Pat subcommand
			name: t("commands:COMMAND_ROLEPLAY_PAT").toLowerCase(),
			description: t("commands:COMMAND_ROLEPLAY_PAT_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to pat
					name: t("common:MEMBER").toLowerCase(),
					name_localizations: tList("common:MEMBER", true),
					description: t("commands:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tList("commands:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
	],

	async runCommand(interaction) {
		// Gets the subcommand and runner
		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser("member");
		let subCommandURL = "";
		let subCommandString = "";

		// Handles edge cases where no subcommand or user was found
		if (!(subcommand && user)) {
			await sendErrorReply(interaction, "common:ERROR_NO_OPTION");
			return;
		}

		// Don't allow self-roleplay
		if (interaction.user.id === user.id) {
			await sendErrorReply(
				interaction,
				"commands:COMMAND_ROLEPLAY_SELF_DETAILS",
			);
			return;
		}

		// Don't allow self-to-bot roleplay
		if (user.id === interaction.client.user.id) {
			await sendErrorReply(
				interaction,
				"commands:COMMAND_ROLEPLAY_BOT_DETAILS",
			);
			return;
		}

		// Gets data to use for each subcommand
		switch (subcommand) {
			case "hug": {
				subCommandURL = "https://cdn.weeb.sh/images/B10Tfknqf.gif";
				subCommandString = t("commands:COMMAND_ROLEPLAY_HUG_DETAILS", {
					lng: interaction.locale,
					user: interaction.user.tag,
					target: user.tag,
				});

				break;
			}

			case "kiss": {
				subCommandURL = "https://cdn.weeb.sh/images/SkKL3adPb.gif";
				subCommandString = t("commands:COMMAND_ROLEPLAY_KISS_DETAILS", {
					lng: interaction.locale,
					user: interaction.user.tag,
					target: user.tag,
				});

				break;
			}

			case "cuddle": {
				subCommandURL = "https://cdn.weeb.sh/images/rkA6SU7w-.gif";
				subCommandString = t("commands:COMMAND_ROLEPLAY_CUDDLE_DETAILS", {
					lng: interaction.locale,
					user: interaction.user.tag,
					target: user.tag,
				});

				break;
			}

			case "pat": {
				subCommandURL = "https://cdn.weeb.sh/images/HJRIlihCZ.gif";
				subCommandString = t("commands:COMMAND_ROLEPLAY_PAT_DETAILS", {
					lng: interaction.locale,
					user: interaction.user.tag,
					target: user.tag,
				});

				break;
			}

			default: {
				break;
			}
		}

		// Sends the interaction
		await interaction.reply({
			embeds: [
				{
					title: subCommandString,
					color: CommandColors.PRIMARY,
					image: {
						url: subCommandURL,
					},
				},
			],
		});
	},
});
