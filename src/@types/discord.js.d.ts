/**
 * @file Extended typing definitions for Discord.js.
 * @license zlib
 */

import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    // A collection of loaded chat (slash) commands. Appended on the client at boot.
    chatCommands: Collection<string, HibikiChatCommand>;

    // The primary ShardingManager instance. Appended on the client at boot.
    sharder: ShardingManager;
  }
}
