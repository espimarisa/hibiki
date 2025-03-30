/**
 * @file Utilities for creating and registering a Hibiki command.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/command
 */

import { MODULE_FILETYPE_REGEX } from "@/utils/fs.js";
import { type ChatInputCommandInteraction, Collection } from "discord.js";
import {
	type APIApplicationCommandOption,
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	type LocalizationMap,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

// Creates a collection of commands
export const HIBIKI_COMMANDS = new Collection<string, HibikiCommand>();

// Hex colors used for embeds
export enum CommandColors {
	PRIMARY = 0xdc267f,
	SECONDARY = 0xffb000,
	ERROR = 0xfe6100,
}

// Typing for a Hibiki command
export interface HibikiCommand {
	// Name of the command. getCommandName(import.meta.file);
	name: string;

	// Description of the command. t("KEY_NAME");
	description: string;

	// Object of name localizations. tList("KEY_NAME", true);
	name_localizations?: LocalizationMap;

	// Object of description localizations. tList("KEY_NAME");
	description_localizations?: LocalizationMap;

	// Array of command interaction options
	options?: APIApplicationCommandOption[];

	// Command interaction type. Defaults to ChatInput if not set.
	type?: ApplicationCommandType;

	// If set to true, only the runner can see a response. Defaults to false.
	ephemeral?: boolean;

	// Makes a command only runnable in NSFW channels. Defaults to false.
	nsfw?: boolean;

	// Whether or not to defer the reply to allow for extra processing time. Defaults to false.
	defer?: boolean;

	// If set, allow installing the command to users/DMs. Defaults to false.
	userInstallable?: boolean;

	/**
	 * Runs a Hibiki command via a Discord interaction.
	 * @param interaction The interaction to run the command on.
	 */

	runCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Registers a Hibiki command into the collection.
 * @param command The command to add to the collection.
 */

export function createCommand(command: HibikiCommand) {
	HIBIKI_COMMANDS.set(command.name, command);
}

/**
 * Generates a clean filename without an extension.
 * @param fileName The filename to remove the extension from.
 * @returns A filename without the extension.
 */

export function getFileName(fileName: string) {
	return fileName.replace(MODULE_FILETYPE_REGEX, "");
}

/**
 * Converts a Hibiki command into a REST-compatible JSON object.
 * @param command The command to convert to REST-compatible JSON.
 * @returns A REST-compatible JSON object with command data.
 */

export function commandToJSON(command: HibikiCommand) {
	// Shorthand to check if it's a user type so I don't go insane
	const isUserCommand = command.type === ApplicationCommandType.User;

	return {
		// Command name
		name: command.name,

		// Command description; user-only commands cannot have it
		description: isUserCommand ? "" : command.description,

		// Command name localizations
		name_localizations: command.name_localizations || {},

		// Command description localizations; user-only commands cannot have it
		description_localizations: isUserCommand
			? undefined
			: command.description_localizations || {},

		// NSFW flag
		nsfw: command.nsfw,

		// Command options; user commands cannot have options
		options: isUserCommand ? [] : command.options,

		// Interaction type. Default to ChatInput if not set
		type: command.type || ApplicationCommandType.ChatInput,

		// Allow running in guild, dms, and group dms if userInstallable
		contexts: command.userInstallable
			? [
					InteractionContextType.Guild,
					InteractionContextType.BotDM,
					InteractionContextType.PrivateChannel,
				]
			: [InteractionContextType.Guild],

		// Sets integration types. Default to guild-only; allow user installations
		integration_types: command.userInstallable
			? [
					ApplicationIntegrationType.GuildInstall,
					ApplicationIntegrationType.UserInstall,
				]
			: [ApplicationIntegrationType.GuildInstall],
	} satisfies RESTPostAPIApplicationCommandsJSONBody;
}
