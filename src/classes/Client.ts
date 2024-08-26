import path from "node:path";
import type { HibikiCommand } from "$classes/Command.ts";
import type { HibikiEvent } from "$classes/Event.ts";
import { env } from "$utils/env.ts";
import { generateInteractionRESTData, loadCommands, loadEvents, registerInteractions } from "$utils/loader.ts";
import { logger } from "$utils/logger.ts";
import { ActivityType, Client, type ClientOptions, type ClientUser } from "discord.js";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));

// Directories to crawl
const COMMANDS_DIRECTORY = path.join(pathDirname, "../commands");
const EVENTS_DIRECTORY = path.join(pathDirname, "../events");
let activityState = 0;

export class HibikiClient extends Client {
  readonly commands = new Map<string, HibikiCommand>();
  readonly events = new Map<string, HibikiEvent>();

  constructor(options: ClientOptions) {
    super(options);
    this.on("error", (err) => {
      logger.error(Bun.inspect(err));
    });
  }

  init() {
    try {
      this.login(env.DISCORD_TOKEN).catch((error: unknown) => {
        throw new Error(Bun.inspect(error));
      });

      this.once("ready", async () => {
        // Loads all commands and events
        await loadCommands(this, COMMANDS_DIRECTORY);
        await loadEvents(this, EVENTS_DIRECTORY);

        logger.info(`Logged in to Discord as ${this.user?.tag}`);
        logger.info(`${this.commands.size.toString()} commands loaded`);
        logger.info(`${this.events.size.toString()} events loaded`);

        // Generates RESTful interaction data
        const RESTData = await generateInteractionRESTData(this);
        if (!RESTData) {
          throw new Error("Failed to generate interaction REST data.");
        }

        // Registers commands; pushes to only one guild if we're in development and an ID is set
        await registerInteractions(this, RESTData, !!(env.DISCORD_TEST_GUILD_ID && env.NODE_ENV !== "production"));

        // Cycles through statuses if any are set
        if (env.DISCORD_STATUSES?.split(", ").length) {
          this.cycleStatuses(this.user!, env.DISCORD_STATUSES.split(", "));
          setInterval(this.cycleStatuses, 30000, this.user!, env.DISCORD_STATUSES.split(", "));
        }
      });
    } catch (error) {
      logger.error("An error occured while starting:");
      throw new Error(Bun.inspect(error));
    }
  }

  // Cycles through statuses
  cycleStatuses(user: ClientUser, statuses: string[]) {
    activityState = (activityState + 1) % statuses.length;
    const presence = statuses[activityState];
    user.setActivity(`${presence?.toString() ?? "unknown"} | v${env.npm_package_version}`, {
      type: ActivityType.Custom,
    });
  }
}
