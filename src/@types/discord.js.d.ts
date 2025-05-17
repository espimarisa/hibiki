/**
 * @file Extended typing definitions for Discord.js.
 * @license zlib
 */

import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    // A collection of loaded commands. Appended on the client at boot.
    commands: Collection<string, HibikiCommand>;

    // The primary ShardingManager instance. Appended on the client at boot.
    sharder: ShardingManager;
  }
}
