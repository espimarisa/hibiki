/**
 * @file Extended typing definitions for Discord.js.
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    /** A collection of loaded Hibiki commands. */
    commands: Collection<string, HibikiCommand>;

    /** The main ShardingManager instance. */
    sharder: ShardingManager;
  }
}
