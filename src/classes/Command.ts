/**
 * @file Command
 * @description Base class for commands
 */

import { Message } from "eris";
import { HibikiClient } from "./Client";

// Command types
export type LocaleString = (string: string, args?: Record<string, unknown> | undefined) => string;
export type ParsedArgs = (commandArgs: string, args: string, msg: Message) => string;

/** Command category names */
export enum CommandCategories {
  FUN = "Fun",
  GENERAL = "General",
  IMAGE = "Image",
  MODERATION = "Moderation",
  MUSIC = "Music",
  NSFW = "NSFW",
  OWNER = "Owner",
  ROLEPLAY = "Roleplay",
  UTILITY = "Utility",
}

/** Main command class */
export abstract class Command {
  aliases: string[] = [];
  args!: string;
  cooldown!: number;
  requiredkeys?: string[] = [];
  clientperms?: string;
  requiredperms?: string;
  allowdms = false;
  nsfw = false;
  owner = false;
  staff = false;

  abstract name: string;
  abstract category: string;
  abstract description: string;

  abstract run(msg: Message, bot?: HibikiClient, string?: LocaleString, args?: ParsedArgs): Promise<unknown> | void;
}
