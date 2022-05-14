/**
 * @file Discord.js types
 * @description Extended Hibiki types for Discord.js
 * @typedef discord.js
 */

import type { getString } from "./locales.js";

declare module "discord.js" {
  declare type ColorResolvable = PrivateColorResolvable;

  declare interface CommandInteraction {
    getString: getString;
  }

  declare interface Message {
    getString: getString;
  }
}
