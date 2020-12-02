/**
 * @file Client
 * @description Connects to Discord and handles all functionality.
 * @author Espi <contact@espi.me>
 */

import { Client } from "eris";
import { Command } from "./Command";
import { Event } from "./Event";
import { CommandHandler } from "./Handler";
import { Logger } from "./Logger";
import { createEmbed, editEmbed, convertHex } from "../helpers/embed";
import { tagUser } from "../helpers/format";
import { botLogger } from "../helpers/logger";
// TODO: Support multiple providers
import { RethinkProvider } from "../providers/rethinkdb";
import { loadItems } from "../utils/loader";
import { version } from "../../package.json";
import Sentry from "@sentry/node";
import config from "../../config.json";

export class hibikiClient extends Client {
  commands: Array<Command> = [];
  cooldowns: Map<string, unknown>;
  events: Array<Event> = [];
  loggers: Array<Logger> = [];
  createEmbed: typeof createEmbed;
  editEmbed: typeof editEmbed;
  convertHex: typeof convertHex;
  tagUser: typeof tagUser;
  commandHandler: CommandHandler;
  log: typeof botLogger;
  db: RethinkProvider;

  constructor(token: string, options: Record<string, unknown>) {
    super(token, options);

    // Collections
    this.commands = [];
    this.events = [];
    this.loggers = [];

    // Prototype extensions
    this.log = botLogger;
    this.createEmbed = createEmbed;
    this.editEmbed = editEmbed;
    this.convertHex = convertHex;
    this.tagUser = tagUser;

    // Handlers & functions
    this.db = new RethinkProvider(this);
    this.commandHandler = new CommandHandler(this);
    this.cooldowns = new Map();

    this.connect();
    this.editStatus("idle");
    this.once("ready", () => this.readyListener());
  }

  // Runs when the bot is ready
  async readyListener(): Promise<void> {
    await loadItems(this);
    if (config.apikeys.sentry) await this.initializeSentry();
    this.switchStatuses();
    this.log.info(`Logged in as ${this.tagUser(this.user)} on ${this.guilds.size} guilds`);
    this.log.info(`${this.commands.length} commands loaded`);
    this.log.info(`${this.events.length} events loaded`);
  }

  // Initializes sentry
  async initializeSentry(): Promise<void> {
    try {
      Sentry.init({
        dsn: config.apikeys.sentry,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.5,
      });
    } catch (err) {
      this.log.error(`Sentry failed to initialize: ${err}`);
    }
  }

  // Rotates bot statuses
  switchStatuses(): void {
    const statuses = config.statuses.map((s) => {
      if (s === "help") s = `${config.prefix}help | hibiki.app`;
      else if (s === "guilds") s = `${this.guilds.size} guilds`;
      else if (s === "users") s = `${this.users.size} users`;
      else if (s === "version") s = `v${version} | hibiki.app`;
      return s;
    });

    // Sets the initial status
    this.editStatus("online", {
      name: statuses[Math.floor(statuses.length * Math.random())],
      type: 3,
      url: "https://twitch.tv/",
    });

    // Timeout for switching
    setInterval(() => {
      this.editStatus("online", {
        name: statuses[Math.floor(statuses.length * Math.random())],
        type: 3,
        url: "https://twitch.tv/.",
      });
    }, 50000);
  }
}
