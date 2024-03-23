import path from "node:path";

import { ActivityType, Client, type ClientOptions } from "discord.js";

import type { HibikiCommand } from "$classes/Command.ts";
import type { HibikiEvent } from "$classes/Event.ts";
import env from "$shared/env.ts";
import logger from "$shared/logger.ts";
import { loadCommands, loadEvents, registerInteractions } from "$utils/loader.ts";

// List of custom statuses to cycle thru
const activities = ["read if h", "meow", "guh"];
let activityState = 0;

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));

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
      this.login(env.DISCORD_TOKEN).catch((error: unknown) => {
        throw new Error(Bun.inspect(error));
      });

      this.once("ready", async () => {
        // Loads all commands and events
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);

        logger.info("Logged in to Discord");
        logger.info(`${this.commands.size.toString()} commands loaded`);
        logger.info(`${this.events.size.toString()} events loaded`);

        // Registers commands; pushes to only one guild if we're in development
        await registerInteractions(this, env.NODE_ENV === "production" ? undefined : env.DISCORD_TEST_GUILD_ID);

        // Cycles through statuses
        setInterval(() => {
          activityState = (activityState + 1) % activities.length;
          const presence = activities[activityState];
          this.user?.setActivity(`${presence?.toString() ?? "unknown"} | v${env.npm_package_version}`, { type: ActivityType.Custom });
        }, 60_000);
      });
    } catch (error) {
      logger.error(`An error occured while starting:`);
      throw new Error(Bun.inspect(error));
    }
  }
}
