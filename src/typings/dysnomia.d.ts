/**
 * @file Discord.js
 * @description Extended Hibiki types for Discord.js
 * @typedef discord.js
 */

import type { getString } from "./locales.js";

declare module "@projectdysnomia/dysnomia" {
  declare interface CommandInteraction {
    getString: getString;
  }
}
