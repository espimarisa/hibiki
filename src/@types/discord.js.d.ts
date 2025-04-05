/**
 * @file Additional typing definitions for Discord.js.
 * @author Espi Marisa <contact@espi.me>
 * @module @types/discord.js.d.ts
 */

import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    slashCommands?: Collection<string, HibikiSlashCommand>;
  }
}
