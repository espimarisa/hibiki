/**
 * @file Utilities for creating and registering a new command.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/command
 */

import { getError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import {
	type ChatInputCommandInteraction,
	Collection,
	type ContextMenuCommandInteraction,
	REST,
	type RouteLike,
	Routes,
	type UserContextMenuCommandInteraction,
} from "discord.js";
import {
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOption,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	type APIUser,
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	type LocalizationMap,
	type RESTPostAPIApplicationCommandsJSONBody,
	type Snowflake,
} from "discord-api-types/v10";

/** Possible command interaction types. */
export type InteractionType =
	| ChatInputCommandInteraction
	| ContextMenuCommandInteraction
	| UserContextMenuCommandInteraction;

/** Possible API command option types. */
export type APIIOptionType =
	| APIApplicationCommandBasicOption
	| APIApplicationCommandSubcommandOption
	| APIApplicationCommandSubcommandGroupOption;

/** REST compatible command body shorthand type. */
export type RESTCommand = RESTPostAPIApplicationCommandsJSONBody;

/** An enum of common colors used. */
export enum CommandColors {
	Primary = 0xff0070,
	Secondary = 0xffa500,
	Success = 0x648fff,
	Error = 0xfe6100,
}

// TODO: runSubCommand()... or getSubResponse()? I forgot.

/** Typing for a bot command. */
export type HibikiCommand = {
	/** Name. Use t("command:COMMAND_NAME"); */
	name: string;

	/** Description. Use t("command:COMMAND_NAME_DESCRIPTION"); */
	description: string;

	/** Name localizations. Use tObj("command:COMMAND_NAME"); */
	name_localizations?: LocalizationMap | null;

	/** Description localizations. Use tObj("command:COMMAND_NAME_DESCRIPTION"); */
	description_localizations?: LocalizationMap | null;

	/** Command type. Defaults to ChatInput. */
	type: ApplicationCommandType;

	/** An array of API-compatible command options. */
	options?: APIApplicationCommandOption[] | undefined;

	/** If true, only the runner will see a response. Defaults to false. */
	ephemeral?: boolean;

	/** Controls where commands are installable. Defaults to 0 for guilds only. */
	integrationTypes?: ApplicationIntegrationType[];

	/** Controls where commands are runnable. Defaults to 0 for guilds only. */
	contexts?: InteractionContextType[];

	/** If true, the command will only run in NSFW channels. Defaults to false. */
	nsfw?: boolean;

	/** If true, allow followUp() and additional processing time. Defaults to false. */
	defer?: boolean;

	/**
	 * Runs a chat input (slash) command.
	 * @param interaction The interaction to run the command on.
	 */

	runSlashCommand?: (interaction: ChatInputCommandInteraction) => Promise<void>;

	/**
	 * Runs a message context menu command.
	 * TODO: Actually parse this properly, this is a placeholder
	 * @param interaction The interaction to run the command on.
	 */

	runMessageCommand?: (
		interaction: ContextMenuCommandInteraction,
	) => Promise<void>;

	/**
	 * Runs a user context menu command.
	 * TODO: Actually parse this properly, this is a placeholder
	 * @param interaction The interaction to run the command on.
	 */

	runUserCommand?: (
		interaction: UserContextMenuCommandInteraction,
	) => Promise<void>;
};

/** A Discord.js collection containing imported commands. */
export const commands = new Collection<string, HibikiCommand>();

/**
 * Runs a command.
 * @param interaction The interaction to run.
 * @param command The command to run.
 */

export async function runCommand(
	interaction: InteractionType,
	command: HibikiCommand,
) {
	// Helper function for deferring a reply
	const defer = async () => {
		await interaction.deferReply({
			flags: command.ephemeral ? ["Ephemeral"] : [],
		});
	};

	switch (command.type) {
		// Run slash commands
		case ApplicationCommandType.ChatInput: {
			if (!command.runSlashCommand) {
				logger.warn(`${command.name} has no slash command handler`);
				return;
			}

			// Defer handler
			if (command.defer) {
				await defer();
			}

			await command.runSlashCommand(interaction as ChatInputCommandInteraction);
			break;
		}

		// Runs a user command
		case ApplicationCommandType.User: {
			if (!command.runUserCommand) {
				logger.warn(`${command.name} has no user context menu handler`);
				return;
			}

			// Defer handler
			if (command.defer) {
				await defer();
			}

			await command.runUserCommand(
				interaction as UserContextMenuCommandInteraction,
			);
			break;
		}

		// Runs a messageContext command
		case ApplicationCommandType.Message: {
			if (!command.runMessageCommand) {
				logger.warn(`${command.name} has no message context menu handler`);
				return;
			}

			// Defer handler
			if (command.defer) {
				await defer();
			}

			await command.runMessageCommand(
				interaction as ContextMenuCommandInteraction,
			);
			break;
		}

		default: {
			break;
		}
	}
}

/**
 * Creates a Hibiki command.
 * @param command The name of the command.
 */

export function createCommand(command: HibikiCommand) {
	commands.set(command.name, command);
}

/**
 * Generates REST-compatible command data.
 * @param command The command to generate data from.
 * @returns A parsed JSON object for use with the Discord REST API.
 */

export function commandToREST(command: HibikiCommand) {
	// Parses command options. Only chatInput commands can have options
	const isChatInput = command.type === ApplicationCommandType.ChatInput;

	return {
		// Validate the name; only 32 lowercase characters are allowed
		name:
			command.name.substring(0, 32).toLowerCase() ??
			Math.random().toString(5).substring(2, 5),
		name_localizations: command.name_localizations
			? normalizeLocales(command.name_localizations, true)
			: null,

		// Validate the description; only 100 characters are allowed
		description: isChatInput ? command.description.substring(0, 100) : "",
		description_localizations: command.description_localizations
			? normalizeLocales(command.description_localizations)
			: null,

		// Validates and normalizes options; only chat input commands can have iut
		options: isChatInput ? normalizeOptions(command.options) : [],

		// Validate the command type; default to ChatInput if unset
		type: command.type || ApplicationCommandType.ChatInput,

		// Validates NSFW setting; default to false if unset
		nsfw: command.nsfw ?? false,

		// Validates contexts & integration types; default to guild only if unset
		contexts: command.contexts ?? [InteractionContextType.Guild],
		integration_types: command.integrationTypes ?? [
			ApplicationIntegrationType.GuildInstall,
		],
	} satisfies RESTCommand;
}

/**
 * Normalizes and parses localization maps.
 * @param field The localization map to normalize.
 * @param isName If it's a name, set the length to 32 and lowercase it.
 * @returns Normalized and/or trimmed localizations.
 */

function normalizeLocales(field: LocalizationMap, isName = false) {
	const data =
		Object.fromEntries(
			Object.entries(field).map(([key, value]) => [
				key,
				isName
					? value?.substring(0, 32).toLowerCase()
					: value?.substring(0, 100),
			]),
		) || null;

	return data;
}

/**
 * Deeply normalizes application options for API registration.
 * @param options An array of application options to normalize.
 * @returns A normalized and valid array of application options.
 */

function normalizeOptions(
	options?: Readonly<APIIOptionType[]>,
): APIIOptionType[] {
	if (!options) {
		return [];
	}

	return options.map((option) => {
		const normalizedOption = {
			...option,

			// Validate the name; only 32 lowercase characters are allowed. Use fallback data in case i18n dies
			name:
				option.name.substring(0, 32).toLowerCase() ??
				Math.random().toString(5).substring(2, 5),
			name_localizations: option.name_localizations
				? normalizeLocales(option.name_localizations, true)
				: null,

			// Validate the description; only 100 chars are allowed
			description: option.description
				? option.description.substring(0, 100)
				: "",
			description_localizations: option.description_localizations
				? normalizeLocales(option.description_localizations)
				: null,
		};

		// Explicitly check if the option is a subcommand or subcommand group
		if ("options" in option) {
			return {
				...normalizedOption,
				options: normalizeOptions(option.options),
			} as
				| APIApplicationCommandSubcommandOption
				| APIApplicationCommandSubcommandGroupOption;
		}

		// If it's a basic option, return as is
		return normalizedOption as APIApplicationCommandBasicOption;
	});
}

/**
 * Registers commands to the Discord API.
 * @param token Discord bot token to authorize with.
 * @param data API application command data to register.
 * @param id ID to use for guild operations.
 * @param local Performs operations only on the guild provided.
 * @param clear Clears all currently registered commands.
 */

export async function registerCommands(
	token: string,
	data?: RESTCommand[],
	id?: Snowflake,
	local = false,
	clear = false,
) {
	const rest = new REST({ version: "10" }).setToken(token);
	const user = (await rest.get("/oauth2/applications/@me")) as
		| APIUser
		| undefined;

	// If this happens, something very bad went wrong :'(
	if (!user?.id) {
		throw new Error("No user ID returned.");
	}

	logger.info(`${clear ? "Clearing" : "Registering"} commands...`);

	// Helper function to register commands
	const registerData = async (route: RouteLike, body: RESTCommand[]) => {
		try {
			await rest.put(route, { body });
			logger.info(
				`Finished ${clear ? "clearing" : `registering ${data?.length}`} commands`,
			);
		} catch (err) {
			const error = getError(err);
			logger.error(`Error during registration: ${error.message}`);
			throw new Error(error.cause);
		}
	};

	// If guildID is provided, register guild commands
	if (id) {
		const route = Routes.applicationGuildCommands(user.id, id);
		await registerData(route, clear ? [] : data || []);

		// Exit after handling the single guild
		if (local) {
			logger.info(`Only ${clear ? "clearing" : "registering to"} guild ${id}`);
			return;
		}
	}

	if (!local) {
		// Register global commands
		const route = Routes.applicationCommands(user.id);
		await registerData(route, clear ? [] : data || []);
	}
}
