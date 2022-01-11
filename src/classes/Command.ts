/**
 * @file Command
 * @description Base class for all commands to extend from
 * @module HibikiCommand
 */

import type { HibikiClient } from "./Client";
import type { ApplicationCommandOptionData, CommandInteraction, Message } from "discord.js";

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

  owner = false;

  // An array of slash command options
  options?: ApplicationCommandOptionData[];

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
      name: this.name,
      description: this.description,
      options: this.options?.length ? this.options : [],
    };
  }

  /**
   * Runs a command via the interaction gateway
   * @param interaction The interaction to handle
   * @param args Additional arguments
   */

  public abstract runWithInteraction(interaction: CommandInteraction, ...args: string[]): Promise<void>;
}
