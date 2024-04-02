import type { APIApplicationCommandOption } from "discord-api-types/v10";
import { ApplicationCommandType, type CommandInteraction } from "discord.js";

import type { HibikiClient } from "$classes/Client.ts";

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

// Localization data
export interface CommandLocalization {
  command: string;
  locale: string;
  name: string;
  description: string;
}

export abstract class HibikiCommand {
  // The type of interaction type. Defaults to CHAT_INPUT.
  interactionType: ApplicationCommandType = ApplicationCommandType.ChatInput;

  // An array of interaction options
  options?: APIApplicationCommandOption[];

  // Whether or not an interaction can only be seen by the runner
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
  public runWithInteraction?(interaction: CommandInteraction, ...args: string[]): Promise<void>;

  // Gets a specific subcommand's response
  getSubCommandResponse?(commandName: string, ...args: string[]): Promise<unknown>;
}

// A callable type for an abstract Hibiki command
export type CallableHibikiCommand = new (_bot: HibikiClient, _name: string) => HibikiCommand;
