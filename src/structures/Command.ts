/**
 * @file Command
 * @description Base class for commands
 * @author Espi <contact@espi.me>
 */

import { Message } from "eris";
import { Argument } from "./Argument";
import { hibikiClient } from "./Client";

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
  args: Argument[] = [];
  cooldown!: number;
  requiredkeys?: string[] = [];
  requiredperms?: PermissionLevel = PermissionLevel.ANYONE;
  allowdms = false;
  nsfw = false;
  owner = false;

  abstract name: string;
  abstract category: string;
  abstract description: string;

  /**
   * Runs a command
   * @param {Message} msg Main message object
   * @param {hibikiClient} bot Main bot object
   * @param {Record<string, unknown>} args Arguments to pass
   */

  abstract run(msg: Message, str: unknown, bot?: hibikiClient, args?: Record<string, unknown>): Promise<void>;
}
