/**
 * @file Discord.js types
 * @description Extended Hibiki types for Discord.js
 * @typedef discord.js
 */

import type { GetLocaleString } from "./locales";

declare module "discord.js" {
  declare interface CommandInteraction {
    getLocaleString: GetLocaleString;
  }
}
