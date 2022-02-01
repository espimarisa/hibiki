/**
 * @file Discord.js types
 * @description Extended Hibiki types for Discord.js
 * @typedef discord.js
 */

import type { getString } from "./locales";

declare module "discord.js" {
  declare interface CommandInteraction {
    getString: getString;
  }

  declare interface Message {
    getString: getString;
  }
}