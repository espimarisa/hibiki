/**
 * @file Utilities for creating and registering a Hibiki command.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/command
 */

import {
	type APIApplicationCommandOption,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	type ApplicationCommandOptionData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	Collection,
	type CommandInteraction,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

// Creates a collection of commands
export const HIBIKI_COMMANDS = new Collection<string, HibikiCommand>();

// Typing for a Hibiki command
export interface HibikiCommand {
	// Name of the command. cleanFileName(import.meta.file);
	name: string;

	// Description of the command. t("commands:COMMAND_NAME_DESCRIPTION");
	description: string;

	// Object of name localizations. TODO
	nameLocalizations?: Record<string, Record<string, string>>;

	// Object of description localizations. TODO
	descriptionLocalizations?: Record<string, Record<string, string>>;

	// Array of command interaction options
	options?: ApplicationCommandOptionData[];

	// Command interaction type. Defaults to ChatInput if not set.
	type?: ApplicationCommandType;

	// If set to true, only the runner can see a response. Defaults to false.
	ephemeral?: boolean;

	// Makes a command only runnable in NSFW channels. Defaults to false.
	nsfw?: boolean;

	// If set, allow installing the command to users/DMs. Defaults to false.
	userInstallable?: boolean;

	/**
	 * Runs a Hibiki command via a Discord interaction.
	 * @param interaction The interaction to run the command on.
	 */

	runCommand: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * Registers a Hibiki command into the collection.
 * @param command The command to add to the collection.
 */

export function createHibikiCommand(command: HibikiCommand) {
	HIBIKI_COMMANDS.set(command.name, command);
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
		name_localizations: command.nameLocalizations || {},

		// Command description localizations; user-only commands cannot have it
		description_localizations: isUserCommand
			? undefined
			: command.descriptionLocalizations || {},

		// NSFW flag
		nsfw: command.nsfw,

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
					// Allow guild + user if userInstallable
					ApplicationIntegrationType.GuildInstall,
					ApplicationIntegrationType.UserInstall,
				]
			: [ApplicationIntegrationType.GuildInstall],

		// Parses command options; user commands cannot have options
		// Why must you make me write annoying nested ternary grossness!
		// Can't you help a guy out and parse this on *YOUR* end? :'(
		options: isUserCommand
			? undefined
			: command.options?.map((option) => {
					switch (option.type) {
						// Return subcommand group option data
						case ApplicationCommandOptionType.SubcommandGroup: {
							return {
								...option,
								options: option.options ? [...option.options] : [],
							} as APIApplicationCommandSubcommandGroupOption;
						}

						// Return subcommand option data
						case ApplicationCommandOptionType.Subcommand: {
							return {
								...option,
								options: option.options ? [...option.options] : [],
							} as APIApplicationCommandSubcommandOption;
						}

						// Return other option data
						default: {
							return option as APIApplicationCommandOption;
						}
					}
				}) || [],
	} satisfies RESTPostAPIApplicationCommandsJSONBody;
}
