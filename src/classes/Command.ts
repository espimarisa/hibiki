/**
 * @file Command
 * @description Base class for commands
 */

import { Message } from "eris";
import { HibikiClient } from "./Client";

// Command types
export type LocaleString = (string: string, args?: Record<string, unknown> | undefined) => string;
export type ParsedArgs = (commandArgs: string, args: string, msg: Message) => string;

// TODO: Actually implement this
export enum PermissionLevel {
  BOT_OWNER,
  SERVER_OWNER,
  SERVER_ADMIN,
  SERVER_MOD,
  ANYONE,
}

/**
 * @enum Command category names
 */

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

/**
 * Main command class
 * @abstract
 */

export abstract class Command {
  aliases: string[] = [];
  args: string;
  cooldown!: number;
  requiredkeys?: string[] = [];
  requiredperms?: PermissionLevel = PermissionLevel.ANYONE;
  allowdms = false;
  nsfw = false;
  owner = false;

  abstract name: string;
  abstract category: string;
  abstract description: string;

  abstract run(msg: Message, str: LocaleString, bot?: HibikiClient, args?: string[], parsedArgs?: ParsedArgs): Promise<void>;
}
