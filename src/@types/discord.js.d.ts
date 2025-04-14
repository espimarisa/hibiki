/**
 * @file Additional typing definitions for Discord.js.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    /** A collection of valid loaded commands. */
    commands?: Collection<string, HibikiCommand>;

    /** A ShardingManager. */
    sharder: ShardingManager;
  }
}
