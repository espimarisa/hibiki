import type { HibikiClient } from "$classes/Client.ts";
import type { PossibleCommandInteractionType } from "$events/CommandInteraction.ts";
import type { API_KEYS } from "$utils/env.ts";
import { type APIApplicationCommandOption, ApplicationCommandType } from "discord-api-types/v10";

// Paramaters to remove from setting in individual command files. Prevents overriding loader-handled data.
type LockedParamaters = "name" | "description" | "name_localizations" | "description_localizations";
type FilteredAPIApplicationCommandOptions<Type> = {
  [APIApplicationCommandOption in keyof Type as Exclude<
    APIApplicationCommandOption,
    LockedParamaters
  >]: Type[APIApplicationCommandOption];
};

// API compatible option block, used for parsing this.options[] with the hack above
export type APIOption = APIApplicationCommandOption;

// Options available to specify in each individual command file
export type HibikiCommandOptions = FilteredAPIApplicationCommandOptions<APIApplicationCommandOption>;

// REST command options for registering interactions
// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
export interface RESTCommandOptions {
  name: string;
  description?: string;
  name_localizations?: Record<string, string>;
  description_localizations?: Record<string, string>;
  options?: APIApplicationCommandOption[];
  type: ApplicationCommandType;
  nsfw?: boolean;
  integration_types?: number[];
  contexts?: number[];
}

export abstract class HibikiCommand {
  description?: string;
  name_localizations?: Record<string, string>;
  description_localizations?: Record<string, string>;

  // The type of command interaction type. Defaults to CHAT_INPUT.
  interactionType: ApplicationCommandType = ApplicationCommandType.ChatInput;

  // An array of command interaction options
  options?: HibikiCommandOptions[];

  // Whether or not a command is user installable. Defaults to false.
  userInstallable = false;

  // Whether or not the interaction response can only be seen by the runner. Defaults to false.
  ephemeral = false;

  // Whether or not an interaction is NSFW. Defaults to false.
  nsfw = false;

  // An array of required API keys that must be provided for a command to load
  requiredAPIKeys?: API_KEYS[];

  // Creates a new Hibiki command
  protected constructor(
    public bot: HibikiClient,
    public name: string,
  ) {}

  // Runs the command
  abstract runCommand(interaction: PossibleCommandInteractionType): Promise<void>;

  // Gets a subcommand response
  getSubCommandResponse?(subCommandName: string, ...args: unknown[]): unknown;
}
