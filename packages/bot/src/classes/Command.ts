import type { HibikiClient } from "$classes/Client.ts";
import { type APIApplicationCommandOption, ApplicationCommandType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";

// Paramaters to remove from setting in files (these are handled by our loader)
export type LockedParamaters = "name" | "description" | "name_localizations" | "description_localizations";
type FilteredAPIApplicationCommandOptions<Type> = {
  [APIApplicationCommandOption in keyof Type as Exclude<
    APIApplicationCommandOption,
    LockedParamaters
  >]: Type[APIApplicationCommandOption];
};

// API compatible option block, used for parsing this.options[] with the hack above
export type APIOption = APIApplicationCommandOption;

// Command options to specify in each Command file
export type HibikiCommandOptions = FilteredAPIApplicationCommandOptions<APIApplicationCommandOption>;

// REST command options
export interface RESTCommandOptions {
  name: string;
  description?: string;
  name_localizations?: Record<string, string>;
  description_localizations?: Record<string, string>;
  options?: APIApplicationCommandOption[];
  type: ApplicationCommandType;
  nsfw?: boolean;
}

export abstract class HibikiCommand {
  // Options set in the loader. No touchy!
  description?: string;
  name_localizations?: Record<string, string>;
  description_localizations?: Record<string, string>;

  // The type of interaction type. Defaults to CHAT_INPUT.
  interactionType: ApplicationCommandType = ApplicationCommandType.ChatInput;

  // An array of interaction options
  options?: HibikiCommandOptions[];

  // Whether or not an interaction can only be seen by the
  ephemeral = false;

  // Whether or not a command is NSFW or not
  nsfw = false;

  // Creates a new Hibiki command
  protected constructor(
    public bot: HibikiClient,
    public name: string,
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Abstract constructor
  ) {}

  // Runs a command via the interaction gateway
  public runWithInteraction?(
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
    ...args: string[]
  ): Promise<void>;

  // Gets a specific subcommand's response
  getSubCommandResponse?(commandName: string, ...args: string[]): Promise<unknown>;
}

// A callable type for an abstract Hibiki command
export type CallableHibikiCommand = new (_bot: HibikiClient, _name: string) => HibikiCommand;
