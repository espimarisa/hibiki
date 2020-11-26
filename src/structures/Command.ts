/**
 * @fileoverview Hibiki command constructor
 * @description Main command constructor for any commands and their enums
 * @author Espi <contact@espi.me>
 */

import { hibikiClient } from "./Client";
import { Message } from "eris";

// TODO: Actually implement this
export enum PermissionLevel {
  BOT_OWNER,
  SERVER_OWNER,
  SERVER_ADMIN,
  SERVER_MOD,
  ANYONE,
}

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

export abstract class Command {
  name: string | undefined;
  aliases?: string[] = [];
  category: string | undefined;
  cooldown?: number;
  description: string | undefined;
  // TODO: Don't load a command if it's missing any requiredKeys in config.json
  requiredkeys?: string[] = [];
  // TODO: add ClientPerms and actually parse this stuff in the handler
  requiredperms: PermissionLevel = PermissionLevel.ANYONE;
  allowdms = false;
  nsfw = false;
  owner = false;

  abstract run(msg: Message, bot?: hibikiClient, args?: Record<string, unknown>): Promise<void>;
}
