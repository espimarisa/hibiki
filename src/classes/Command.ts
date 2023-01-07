/**
 * @file Command
 * @description Base class for all commands to extend from
 * @module HibikiCommand
 */

import type { HibikiClient } from "./Client.js";
import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, Message } from "discord.js";

/**
 * Hibiki command data in JSON form for slash command registration
 */

export interface HibikiCommandJSON {
  // The command name, inherited from the filename
  name: string;

  // The command description
  description: string;

  // Slash command options
  options?: APIApplicationCommandOption[];
}

// A callable type for an abstract Hibiki command, including the constructor
export interface CallableHibikiCommand {
  new (bot: HibikiClient, name: string, category: string): HibikiCommand;
}

export abstract class HibikiCommand {
  /**
   * Whether or not the command is a message-only command
   * Also prevents being deployed as a slash command
   * @deprecated Since 5.0.0-alpha
   * @see MIGRATION.md
   */

  messageOnly = false;

  /**
   * Whether or not to restrict a command to the application owner
   * Also prevents being deployed as a slash command
   * MUST be used with messageOnly!
   * @deprecated Since v5.0.0-alpha
   */

  ownerOnly = false;

  // Whether or not the command should be seen by other members; aka private response.
  ephemeral = false;

  // An array of slash command options
  options?: APIApplicationCommandOption[];

  // A short description of a command
  abstract description: string;

  /**
   * Creates a new Hibiki command
   * @param bot Main bot object
   * @param name The command name (matches the filename)
   * @param category The command category (matches the directory)
   */

  protected constructor(protected bot: HibikiClient, public name: string, public category: string) {}

  /**
   * Converts a Hibiki command to Discord API-compatible JSON
   * @returns A JSON object for a valid slash command
   */

  public toJSON(): HibikiCommandJSON {
    return {
      name: this.name.toLowerCase(),
      description: this.description,

      // TODO: Add a validator here.
      // Be sure to follow slash command option validation. For example, ALL names must be lowercase with no spaces.
      // Correct: guild_id : incorrect: Guild ID
      // Also: Use the enum for the type for ease-of-use
      options: this.options ?? [],
    };
  }
  /**
   * Runs a command via the interaction gateway
   * @param interaction The interaction to handle
   * @param args Additional arguments
   */

  public runWithInteraction?(interaction: ChatInputCommandInteraction, ...args: string[]): Promise<void>;

  /**
   * Gets a specific subcommand's response
   * @param commandName The subcommand name to get
   * @param args Additional arguments
   */

  public getSubCommandResponse?(commandName: string, ...args: string[]): Promise<unknown>;

  /**
   * Runs a command via the legacy message API
   * @param msg The message object to utilise
   * @param args Arguments passed through the command
   * @deprecated Since 5.0.0-alpha
   * @see MIGRATION.md
   */

  public runWithMessage?(msg: Message, args?: string[]): Promise<void>;
}
