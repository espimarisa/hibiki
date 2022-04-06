/**
 * @file Command
 * @description Base class for all commands to extend from
 * @module HibikiCommand
 */

import type { HibikiClient } from "./Client";
import type { APIApplicationCommandOption } from "discord-api-types/v9";
import type { CommandInteraction, Message } from "discord.js";

export abstract class HibikiCommand {
  /**
   * Whether or not the command is a message-only command
   * Also prevents being deployed as a slash command
   * @see MIGRATION.md
   */

  messageOnly = false;

  /**
   * Whether or not to restrict a command to the application owner
   * Also prevents being deployed as a slash command
   * MUST be used with messageOnly!
   */

  ownerOnly = false;

  /**
   * How long the user has to wait before reusing the command
   */

  cooldown = 0;

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

  protected constructor(protected bot: HibikiClient, public name: string, public category: HibikiCommandCategory) {}

  /**
   * Runs a command via the legacy message API
   * @param msg The message object to utilise
   * @param args Arguments passed through the command
   * @see MIGRATION.md
   */

  public runWithMessage?(msg: Message, args?: string[]): Promise<void>;

  /**
   * Gets a specific subcommand's response
   * @param commandName The subcommand name to get
   * @param args Additional arguments
   */

  public getSubCommandResponse?(commandName: string, ...args: string[]): Promise<any>;

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
      options: this.options?.length ? this.options : [],
    };
  }

  /**
   * Runs a command via the interaction gateway
   * @param interaction The interaction to handle
   * @param args Additional arguments
   */

  public runWithInteraction?(interaction: CommandInteraction, ...args: string[]): Promise<void>;
}
