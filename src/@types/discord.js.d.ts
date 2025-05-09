/**
 * @file Extended typing definitions for Discord.js.
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    // A collection of loaded commands.
    commands: Collection<string, HibikiCommand>;

    // The primary ShardingManager instance.
    sharder: ShardingManager;
  }
}
