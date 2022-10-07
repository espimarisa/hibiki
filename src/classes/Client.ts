/**
 * @file Client
 * @description Connects to Discord and handles global functions
 */

import type { HibikiCommand } from "./Command.js";
import type { HibikiEvent } from "./Event.js";
import type { HibikiLogger } from "./Logger.js";
import { loadCommands, loadEvents, registerSlashCommands } from "../utils/loader.js";
import { logger } from "../utils/logger.js";
import { DatabaseManager } from "./Database.js";
import { HibikiLocaleSystem } from "./LocaleSystem.js";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import path from "node:path";
import url from "node:url";

// Are we being sane or not?
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");
const LOGGERS_DIRECTORY = path.join(pathDirname, "../loggers");
const LOCALES_DIRECTORY = path.join(pathDirname, "../locales");

export class HibikiClient extends Client {
  readonly config: HibikiConfig;
  // A Prisma + Hibiki Database Manager
  readonly db: DatabaseManager = new DatabaseManager();

  // A collection of commands
  readonly commands: Collection<string, HibikiCommand> = new Collection();

  // A collection of events
  readonly events: Collection<string, HibikiEvent> = new Collection();

  // A collection of loggers
  readonly loggers: Collection<string, HibikiLogger> = new Collection();

  // Hibiki's locale system
  readonly localeSystem: HibikiLocaleSystem;

  constructor(config: HibikiConfig) {
    super({ ...config.clientOptions, intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    this.config = config;

    // Creates a new Locale System engine
    this.localeSystem = new HibikiLocaleSystem(LOCALES_DIRECTORY, this.config.defaultLocale);
  }

  /**
   * Initialises Hibiki
   */

  public init() {
    try {
      // Logs into the Discord API, I guess
      this.login(this.config.token);

      // Wait for the initial login before loading modules
      this.once("ready", async () => {
        // Loads all commands, events, and loggers
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);
        await loadEvents(this, LOGGERS_DIRECTORY, true);

        // Registers commands; pushes to only one guild if we're in development
        registerSlashCommands(this, !IS_PRODUCTION ? this.config.testGuildID : undefined);

        logger.info(`Logged in as ${this.user?.tag} in ${this.guilds.cache.size} guilds on shard #${this.shard?.ids[0]}`);
        logger.info(`${this.commands.size} commands loaded on shard #${this.shard?.ids[0]}`);
        logger.info(`${this.events.size} events loaded on shard #${this.shard?.ids[0]}`);
      });
    } catch (error) {
      logger.error(`An error occured while initializing Hibiki: ${error}`);
    }
  }
}
