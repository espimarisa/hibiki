/**
 * @file HibikiClient
 * @description Connects to Discord and handles all internal modules
 */

import type { HibikiCommand } from "./Command.js";
import type { HibikiEvent } from "./Event.js";
import type { HibikiLocaleCode } from "../typings/locales.js";
import { sanitizedEnv } from "../utils/env.js";
import { loadCommands, loadEvents, registerInteractions } from "../utils/loader.js";
import { logger } from "../utils/logger.js";
import { DatabaseManager } from "./Database.js";
import { HibikiLocaleSystem } from "./LocaleSystem.js";
import { Client, type ClientOptions } from "@projectdysnomia/dysnomia";
import { ClusterClient } from "discord-hybrid-sharding";
import path from "node:path";
import url from "node:url";
import util from "node:util";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");
const LOCALES_DIRECTORY = path.join(pathDirname, "../locales");

export class HibikiClient extends Client {
  readonly commands: Map<string, HibikiCommand> = new Map();
  readonly events: Map<string, HibikiEvent> = new Map();

  // A Prisma + Hibiki Database Manager
  readonly db: DatabaseManager = new DatabaseManager();

  // Creates a new Hibiki locale system
  readonly localeSystem: HibikiLocaleSystem;

  // Creates a new sharding management client
  readonly cluster: ClusterClient<HibikiClient> = new ClusterClient(this);

  constructor(token: string, options: ClientOptions) {
    super(token, options);

    // Creates a new Locale system
    this.localeSystem = new HibikiLocaleSystem(LOCALES_DIRECTORY, sanitizedEnv.DEFAULT_LOCALE as HibikiLocaleCode);

    // Logs when a specific shard is ready
    this.on("shardReady", (id) => {
      logger.info(`Shard #${id} is ready`);
    });

    // Logs errors
    this.on("error", (err) => {
      logger.error(util.inspect(err));
    });

    // Connects & initializes when ready
    this.connect().then(() => {
      this.init();
    });
  }

  // Starts Hibiki
  public init() {
    try {
      this.once("ready", async () => {
        // Loads all commands and events
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);

        // Logs statistics and other stuff
        logger.info("Logged in to Discord");
        logger.info(`${this.commands.size} commands loaded`);
        logger.info(`${this.events.size} events loaded`);

        // Registers commands; pushes to only one guild if we're in development
        registerInteractions(this, !sanitizedEnv.isProduction ? sanitizedEnv.TEST_GUILD_ID : undefined);
      });
    } catch (error) {
      logger.error(`An error occured while starting: ${util.inspect(error)}`);
    }
  }
}
