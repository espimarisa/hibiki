/**
 * @file Extended typing definitions for Discord.js.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { Collection } from "discord.js";
import type { HibikiCommand } from "@/helpers/command.js";

declare module "discord.js" {
  interface Client {
    /** A collection of loaded Hibiki commands. */
    commands: Collection<string, HibikiCommand>;

    /** The main ShardingManager instance. */
    sharder: ShardingManager;
  }
}
