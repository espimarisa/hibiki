/**
 * @file HibikiClient
 * @description Connects to Discord and handles global functionality
 * @module HibikiClient
 */

import type { HibikiCommand } from "./Command.js";
import type { HibikiEvent } from "./Event.js";
import type { HibikiLogger } from "./Logger.js";
import type { HibikiProvider } from "./Provider.js";
import { loadCommands, loadEvents, registerSlashCommands } from "../utils/loader.js";
import { logger } from "../utils/logger.js";
import { HibikiLocaleSystem } from "./LocaleSystem.js";
import { getDatabaseProvider } from "./Provider.js";
import { Client, Collection, Intents } from "discord.js";
import path from "node:path";

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(__dirname, "../commands");
const EVENTS_DIRECTORY = path.join(__dirname, "../events");
const LOGGERS_DIRECTORY = path.join(__dirname, "../loggers");
const PROVIDERS_DIRECTORY = path.join(__dirname, "../providers");
const LOCALES_DIRECTORY = path.join(__dirname, "../locales");

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export class HibikiClient extends Client {
  // Hibiki's config file
  readonly config: HibikiConfig;

  // A collection of commands
  readonly commands: Collection<string, HibikiCommand> = new Collection();

  // A collection of events
  readonly events: Collection<string, HibikiEvent> = new Collection();

  // A collection of loggers
  readonly loggers: Collection<string, HibikiLogger> = new Collection();

  // A collection of cooldowns
  readonly cooldowns: Collection<string, Date> = new Collection();

  // Null database provider to be loaded later
  readonly db: HibikiProvider;

  // Hibiki's locale system
  readonly localeSystem: HibikiLocaleSystem;

  // Hibiki's current version, defined in package.json
  readonly version: string = process.env.npm_package_version ?? "develop";

  /**
   * Creates a new instance of the Hibiki client
   * @param config A valid Hibiki config to utilize
   */

  constructor(config: HibikiConfig) {
    // super({ ...config.options, intents});
    super({
      ...config.options,
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    });

    this.config = config;

    // Finds the database provider to use
    const HibikiDatabaseProvider = getDatabaseProvider(this.config.database?.provider ?? "json", PROVIDERS_DIRECTORY);

    // Handlers & functions
    this.db = new HibikiDatabaseProvider(this);
    this.localeSystem = new HibikiLocaleSystem(LOCALES_DIRECTORY, this.config.hibiki.locale);
  }

  /**
   * Starts the client
   */

  public init() {
    this.login(this.config.hibiki.token).then(async () => {
      await this.db.init();

      // Loads commands, events, and loggers
      loadCommands(this, COMMANDS_DIRECTORY);
      loadEvents(this, EVENTS_DIRECTORY);
      loadEvents(this, LOGGERS_DIRECTORY, true);

      // Registers commands, push to only one guild if we're in development
      registerSlashCommands(this, IS_DEVELOPMENT ? this.config.hibiki.testGuildID : undefined);

      const shardString = this.shard ? `on shard #${this.shard?.ids[0]}` : "on main";
      logger.info(`Logged in as ${this.user?.tag} in ${this.guilds.cache.size} guilds ${shardString}`);
      logger.info(`${this.commands.size} commands; ${this.events.size} events loaded ${shardString}`);
      logger.info(`${Object.keys(this.localeSystem.locales).length} locales loaded ${shardString}`);
    });
  }
}
