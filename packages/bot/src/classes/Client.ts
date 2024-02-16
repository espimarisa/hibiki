import type { HibikiCommand } from "$classes/Command.ts";
import type { HibikiEvent } from "$classes/Event.ts";
import { loadCommands, loadEvents, registerInteractions } from "$utils/loader.ts";
import env from "$shared/env.ts";
import logger from "$shared/logger.ts";
import { Client, type ClientOptions } from "discord.js";
import path from "node:path";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(new URL(import.meta.url)));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");

export class HibikiClient extends Client {
  readonly commands = new Map<string, HibikiCommand>();
  readonly events = new Map<string, HibikiEvent>();

  constructor(options: ClientOptions) {
    super(options);

    // Logs errors
    this.on("error", (err) => {
      logger.error(Bun.inspect(err));
    });
  }

  public init() {
    try {
      this.login(env.BOT_TOKEN).catch((error) => {
        throw new Error(Bun.inspect(error));
      });

      this.once("ready", async () => {
        // Loads all commands and events
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);

        logger.info("Logged in to Discord");
        logger.info(`${this.commands.size} commands loaded`);
        logger.info(`${this.events.size} events loaded`);

        // Registers commands; pushes to only one guild if we're in development
        await registerInteractions(this, env.NODE_ENV === "production" ? undefined : env.BOT_TEST_GUILD_ID);
      });
    } catch (error) {
      logger.error(`An error occured while starting:`);
      throw new Error(Bun.inspect(error));
    }
  }
}
