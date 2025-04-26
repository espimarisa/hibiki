/**
 * @file Additional typing definitions for Discord.js.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    /** The collection of loaded commands appended to the client at boot. */
    commands: Collection<string, HibikiSlashCommand>;

    /** A ShardingManager instance appended to the client at boot. */
    sharder: ShardingManager;
  }
}
