/**
 * @file Command
 * @description Base class for all commands to extend from
 * @module HibikiCommand
 */

import type { HibikiClient } from "./Client";
import type { ApplicationCommandOptionData, CommandInteraction, Message } from "discord.js";

export abstract class HibikiCommand {
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
   * Runs a command via the interaction gateway
   * @param interaction The interaction to handle
   */

  public abstract runWithInteraction(interaction: CommandInteraction, ...args: string[]): Promise<void>;

  /**
   * Runs a command via the legacy message API
   * @param msg The message object to utilise
   */

  public abstract runWithMessage(msg: Message): Promise<void>;

  /**
   * Gets the message response for a command
   * @param localeParser The function to return locale strings with
   */

  public abstract getResponse(localeParser: GetLocaleString): Promise<FullMessageEmbedData>;
}
