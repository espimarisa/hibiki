import type { HibikiCommand } from "./Command.js";
import type { HibikiEvent } from "./Event.js";
import { sanitizedEnv } from "../utils/env.js";
import { loadCommands, loadEvents } from "../utils/loader.js";
import { logger } from "../utils/logger.js";
import { Client, type ClientOptions } from "discord.js";
import path from "node:path";
import url from "node:url";
import util from "node:util";
import { DatabaseManager } from "./Database.js";
import { HibikiLocaleSystem } from "./LocaleSystem.js";
import type { HibikiLocaleCode } from "../typings/locales.js";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");
const LOCALES_DIRECTORY = path.join(pathDirname, "../locales");

export class HibikiClient extends Client {
  readonly commands: Map<string, HibikiCommand> = new Map();
  readonly events: Map<string, HibikiEvent> = new Map();

  readonly db: DatabaseManager = new DatabaseManager();
  readonly localeSystem: HibikiLocaleSystem;

  constructor(options: ClientOptions) {
    super(options);

    this.localeSystem = new HibikiLocaleSystem(LOCALES_DIRECTORY, sanitizedEnv.DEFAULT_LOCALE as HibikiLocaleCode);

    // Logs errors
    this.on("error", (err) => {
      logger.error(util.inspect(err));
    });
  }

  // Starts Hibiki
  public init() {
    try {
      this.login(sanitizedEnv.BOT_TOKEN);

      this.once("ready", async () => {
        // Loads all commands and events
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);

        // Logs statistics and other stuff
        logger.info("Logged in to Discord");
        logger.info(`${this.commands.size} commands loaded`);
        logger.info(`${this.events.size} events loaded`);
      });
    } catch (error) {
      logger.error(`An error occured while starting: ${util.inspect(error)}`);
    }
  }
}
