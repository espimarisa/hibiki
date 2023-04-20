/**
 * @file HibikiCommand
 * @description Base class for all commands to extend from
 * @module HibikiCommand
 */

import type { HibikiClient } from "./Client.js";
import type { APIApplicationCommandOption } from "discord-api-types/v10";
import { Constants, CommandInteraction, type ApplicationCommandTypes } from "@projectdysnomia/dysnomia";

export abstract class HibikiCommand {
  // The type of interaction type. Defaults to CHAT_INPUT.
  interactionType?: ApplicationCommandTypes = Constants.ApplicationCommandTypes.CHAT_INPUT;

  // An array of slash command options
  options?: APIApplicationCommandOption[];

  /**
   * Whether or not the command is a message-only command
   * @deprecated Since 5.0.0-alpha
   */

  messageOnly = false;

  /**
   * Whether or not to restrict a command to the application owner
   * @deprecated Since v5.0.0-alpha
   */

  ownerOnly = false;

  // Whether or not a command can only be seen by the runner
  ephemeral = false;

  // A short description of a command
  abstract description: string;

  /**
   * Creates a new Hibiki command
   * @param bot Main bot object
   * @param name The command name (matches the filename)
   */

  protected constructor(protected bot: HibikiClient, public name: string) {}

  /**
   * Converts a Hibiki command to Discord API-compatible JSON
   * @returns A JSON object for a valid slash command
   */

  public toJSON() {
    return {
      name: this.name.toLowerCase(),
      description: this.interactionType === Constants.ApplicationCommandTypes.CHAT_INPUT ? this.description : undefined,
      options: this.options,
      type: this.interactionType,
    };
  }

  /**
   * Runs a command via the interaction gateway
   * @param interaction The interaction to handle
   * @param args Additional arguments
   */

  public runWithInteraction?(interaction: CommandInteraction, ...args: string[]): Promise<void>;
}

// A callable type for an abstract Hibiki command
export interface CallableHibikiCommand {
  new (bot: HibikiClient, name: string): HibikiCommand;
}
