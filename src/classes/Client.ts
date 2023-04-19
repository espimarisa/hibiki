/**
 * @file HibikiClient
 * @description Connects to Discord and handles all internal modules
 * @module HibikiClient
 */

import type { HibikiCommand } from "./Command.js";
import type { HibikiEvent } from "./Event.js";
import { env } from "../utils/env.js";
import { tagUser } from "../utils/format.js";
import { loadCommands, loadEvents, registerSlashCommands } from "../utils/loader.js";
import { logger } from "../utils/logger.js";
import { DatabaseManager } from "./Database.js";
import { Client, type ClientOptions } from "@projectdysnomia/dysnomia";
import path from "node:path";
import url from "node:url";
import util from "node:util";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");

export class HibikiClient extends Client {
  readonly commands: Map<string, HibikiCommand> = new Map();
  readonly events: Map<string, HibikiEvent> = new Map();

  // A Prisma + Hibiki Database Manager
  readonly db: DatabaseManager = new DatabaseManager();

  constructor(token: string, options: ClientOptions) {
    super(token, options);

    // Logs when a specific shard is ready
    this.on("shardReady", (id) => {
      logger.info(`Shard #${id} is ready`);
    });

    // Logs errors
    this.on("error", (err) => {
      logger.error(util.inspect(err));
    });
  }

  /**
   * Initializes Hibiki
   */

  public init() {
    try {
      this.connect();
      this.once("ready", async () => {
        // Loads all commands and events
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);

        // Logs statistics and other stuff
        logger.info(`Logged in to Discord as ${tagUser(this.user)}`);
        logger.info(`${this.commands.size} commands loaded`);
        logger.info(`${this.events.size} events loaded`);

        // Registers commands; pushes to only one guild if we're in development
        registerSlashCommands(this, !env.isProduction ? env.TEST_GUILD_ID : undefined);
      });
    } catch (error) {
      logger.error(`An error occured while starting: ${util.inspect(error)}`);
    }
  }
}
