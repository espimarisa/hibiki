/**
 * @file Command for user-to-user roleplay and interaction.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/roleplay
 */

import { createCommand } from "@/utils/command.js";
import { errorReply } from "@/utils/error.js";
import { t, tObj } from "@/utils/i18n.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord-api-types/v10";

export const roleplayCommand = createCommand({
	name: t("command:COMMAND_ROLEPLAY_NAME"),
	name_localizations: tObj("command:COMMAND_ROLEPLAY_NAME"),
	description: t("command:COMMAND_ROLEPLAY_DESCRIPTION"),
	description_localizations: tObj("command:COMMAND_ROLEPLAY_DESCRIPTION"),
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			// Hug subcommand
			name: t("command:COMMAND_ROLEPLAY_HUG"),
			description: t("command:COMMAND_ROLEPLAY_HUG_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to hug
					name: t("common:MEMBER"),
					name_localizations: tObj("common:MEMBER"),
					description: t("command:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tObj("command:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			// Kiss subcommand
			name: t("command:COMMAND_ROLEPLAY_KISS"),
			description: t("command:COMMAND_ROLEPLAY_KISS_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to kiss
					name: t("common:MEMBER"),
					name_localizations: tObj("common:MEMBER"),
					description: t("command:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tObj("command:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			// Cuddle subcommand
			name: t("command:COMMAND_ROLEPLAY_CUDDLE"),
			description: t("command:COMMAND_ROLEPLAY_CUDDLE_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to cuddle
					name: t("common:MEMBER"),
					name_localizations: tObj("common:MEMBER"),
					description: t("command:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tObj("command:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			// Pat subcommand
			name: t("command:COMMAND_ROLEPLAY_PAT"),
			description: t("command:COMMAND_ROLEPLAY_PAT_DESCRIPTION"),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					// The member to pat
					name: t("common:MEMBER"),
					name_localizations: tObj("common:MEMBER"),
					description: t("command:COMMAND_ROLEPLAY_TARGET"),
					description_localizations: tObj("command:COMMAND_ROLEPLAY_TARGET"),
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
	],

	async runSlashCommand(interaction) {
		// Gets the subcommand and runner
		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser("member");

		// Handles edge cases where no subcommand or user was found
		if (!(subcommand && user)) {
			await errorReply(interaction, "error:ERROR_NO_OPTION");
			return;
		}

		// Don't allow self-roleplay
		if (interaction.user.id === user.id) {
			await errorReply(interaction, "command:COMMAND_ROLEPLAY_SELF_DETAILS");

			return;
		}

		// Don't allow self-to-bot roleplay
		if (user.id === interaction.client.user.id) {
			await errorReply(interaction, "command:COMMAND_ROLEPLAY_BOT_DETAILS");

			return;
		}

		await interaction.reply("it works bitch lol");
	},
});
