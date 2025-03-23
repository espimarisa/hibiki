/**
 * @file typings
 * @description Global typings used throughout the application.
 * @author Espi Marisa <contact@espi.me>
 */

import type { bot } from "$root/bot.ts";
import type {
	ApplicationCommandOption,
	ApplicationCommandTypes,
} from "@discordeno/bot";

/**
 * A Hibiki command.
 */

export interface HibikiCommand {
	// The command name. Use i18n to get it.
	name: string;

	// A short description of the command. Use i18n to get it.
	description: string;

	// The type of command.
	type: ApplicationCommandTypes;

	// Command options.
	// TODO: Localization.
	options: ApplicationCommandOption[];

	/**
	 * Runs a Hibiki command.
	 * @param interaction The interaction to run with.
	 * @param options Optional parsed interaction options.
	 */

	runCommand: (
		interaction: typeof bot.transformers.$inferredTypes.interaction,
		options?: unknown[],
	) => Promise<void>;
}
