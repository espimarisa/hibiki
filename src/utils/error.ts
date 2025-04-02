/**
 * @file Utilities for capturing and debugging errors.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/error
 */

import type { DictionaryKey } from "@/types/i18next.js";
import { CommandColors, type InteractionType } from "@/utils/command.js";
import { t } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import type { EmbedData } from "discord.js";

const fallback = "Unknown error";

/**
 * Parses a possible error object and returns the stack.
 * @param error A possible error object to parse.
 * @returns A valid Error object or error message.
 */

export function getError(error: unknown) {
	// Return parsed error object
	if (error instanceof Error) {
		return {
			cause: error.cause ? Bun.inspect(error.cause) : (error.stack ?? fallback),
			message: error.message,
			stack: error.stack ?? fallback,
			name: error.name,
		} satisfies Error;
	}

	return {
		cause: fallback,
		message: typeof error === "string" ? error : fallback,
		stack: fallback,
		name: fallback,
	} satisfies Error;
}

/**
 * Sends an error reply to an interaction.
 * @param interaction The interaction to send the reply on.
 * @param string The string to translate and send in the error message.
 * @param deferred If set, will run .followUp(). Defaults to false.
 * @param variables Additional variables to pass to i18next.
 */

export async function errorReply(
	interaction: InteractionType,
	string: DictionaryKey,
	deferred = false,
	variables: Record<string, unknown> = {},
) {
	// Prepare embed message
	const embed = {
		title: t("error:ERROR", { lng: interaction.locale }),
		description: t(string, { ...variables, lng: interaction.locale }),
		color: CommandColors.Error,
		footer: {
			text: t("error:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
			iconURL: interaction.client.user.displayAvatarURL(),
		},
	} satisfies EmbedData;

	try {
		await (deferred
			? interaction.followUp({ embeds: [embed] })
			: interaction.reply({ embeds: [embed] }));
	} catch (err) {
		logger.warn(`Failed to send error reply: ${getError(err).message}`);
	}
}
