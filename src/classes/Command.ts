/**
 * @file HibikiCommand
 * @description Base class for all commands to extend from
 * @module HibikiCommand
 */

import type { HibikiClient } from "./Client.js";

export abstract class HibikiCommand {
  // A short description of a command
  abstract description: string;

  /**
   * Creates a new Hibiki command
   * @param bot Main bot object
   * @param name The command name (matches the filename)
   */

  protected constructor(protected bot: HibikiClient, public name: string) {}
}

// A callable type for an abstract Hibiki command
export interface CallableHibikiCommand {
  new (bot: HibikiClient, name: string): HibikiCommand;
}
