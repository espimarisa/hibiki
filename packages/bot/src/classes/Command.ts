import type { HibikiClient } from "./Client.js";
import type { APIApplicationCommandOption } from "discord-api-types/v10";
import { CommandInteraction, ApplicationCommandType } from "discord.js";

export abstract class HibikiCommand {
  // The type of interaction type. Defaults to CHAT_INPUT.
  interactionType?: ApplicationCommandType = ApplicationCommandType.ChatInput;

  // An array of interaction options
  options?: APIApplicationCommandOption[];

  // Whether or not an interaction can only be seen by the runner
  ephemeral = false;

  // A short description of a command
  abstract description: string;

  // Creates a new Hibiki command
  protected constructor(
    protected bot: HibikiClient,
    public name: string,
  ) {}

  // Converts a Hibiki command to Discord API-compatible JSON
  public toJSON() {
    return {
      name: this.name.toLowerCase(),
      description: this.interactionType === ApplicationCommandType.ChatInput ? this.description : undefined,
      options: this.options,
      type: this.interactionType,
    };
  }

  // Runs a command via the interaction gateway
  public runWithInteraction?(interaction: CommandInteraction, ...args: string[]): Promise<void>;
}

// A callable type for an abstract Hibiki command
export type CallableHibikiCommand = new (bot: HibikiClient, name: string) => HibikiCommand;

// Valid Command JSON type
export interface HibikiCommandJSON {
  name: string;
  description?: string;
  options?: APIApplicationCommandOption[];
  type?: ApplicationCommandType;
}
