import type { HibikiCommand } from "./Command.js";
import type { HibikiEvent } from "./Event.js";
import { loadCommands, loadEvents } from "../utils/loader.js";
import { DatabaseManager } from "./Database.js";
import { sanitizedEnv } from "$shared/env.js";
import { logger } from "$shared/logger.js";
import { Client, type ClientOptions } from "discord.js";
import path from "node:path";
import url from "node:url";
import util from "node:util";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");

export class HibikiClient extends Client {
  readonly commands = new Map<string, HibikiCommand>();
  readonly events = new Map<string, HibikiEvent>();

  readonly db: DatabaseManager = new DatabaseManager();

  constructor(options: ClientOptions) {
    super(options);
    // Logs errors
    this.on("error", (err) => {
      logger.error(util.inspect(err));
    });
  }

  // Starts Hibiki
  public init() {
    try {
      this.login(sanitizedEnv.TOKEN).catch((error) => {
        throw new Error(`${error}`);
      });

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
