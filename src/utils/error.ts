/**
 * @file Utilities for capturing and debugging errors.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/error
 */

import type { HIBIKI_DICTIONARY_KEYS } from "@/types/i18next.js";
import { CommandColors } from "@/utils/command.js";
import { env } from "@/utils/env.js";
import { t } from "@/utils/i18n.js";
import { loaderLogger } from "@/utils/logger.js";
import { init } from "@sentry/bun";
import type { ChatInputCommandInteraction, EmbedData } from "discord.js";

/**
 * Connects to a Sentry DSN.
 */

export function initSentry() {
	if (!env.SENTRY_DSN) {
		return;
	}

	try {
		init({
			dsn: env.SENTRY_DSN,
			environment: env.NODE_ENV,
			release: env.npm_package_version,
		});

		loaderLogger.info("Successfully connected to Sentry");
	} catch (error) {
		loaderLogger.error("Error while connecting to Sentry:");
		throw new Error(Bun.inspect(error));
	}
}

/**
 * Sends an error message to an interaction.
 * @param interaction The interaction to send the reply on.
 * @param string The string to translate and send in the error message.
 * @param followUp Whether or not to use followUp(). Defaults to false.
 */

export async function sendErrorReply(
	interaction: ChatInputCommandInteraction,
	string: HIBIKI_DICTIONARY_KEYS,
	followUp = false,
) {
	// Embed data
	const embed = {
		title: t("ERROR", { lng: interaction.locale }),
		description: t(string, { "lng": interaction.locale }),
		color: CommandColors.ERROR,
		footer: {
			text: t("common:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
			iconURL: interaction.client.user.displayAvatarURL(),
		},
	} satisfies EmbedData;

	// Send followup messages
	if (followUp) {
		await interaction.followUp({ embeds: [embed] });
		return;
	}

	// Send normal replies
	await interaction.reply({ embeds: [embed] });
	return;
}
