/**
 * @file Client
 * @description Connects to Discord and handles global functions
 */

import { Client } from "eris";
import { Args } from "./Args";
import { Command } from "./Command";
import { Event } from "./Event";
import { LocaleSystem } from "./Locale";
import { Logger } from "./Logger";
import { RethinkProvider } from "../providers/rethinkdb";
import { createEmbed, editEmbed, convertHex } from "../helpers/embed";
import { tagUser } from "../helpers/format";
import { loadItems } from "../helpers/loader";
import { botLogger } from "../helpers/logger";
import { switchStatuses } from "../helpers/statuses";
import config from "../../config.json";
import Sentry from "@sentry/node";
import path from "path";

const LOCALES_DIRECTORY = path.join(__dirname, "../locales");

export class HibikiClient extends Client {
  commands: Array<Command> = [];
  events: Array<Event> = [];
  loggers: Array<Logger> = [];
  cooldowns: Map<string, unknown>;
  createEmbed: typeof createEmbed;
  editEmbed: typeof editEmbed;
  convertHex: typeof convertHex;
  tagUser: typeof tagUser;
  localeSystem: LocaleSystem;
  args: Args;
  db: RethinkProvider;
  log: typeof botLogger;

  constructor(token: string, options: Record<string, unknown>) {
    super(token, options);

    // Collections
    this.commands = [];
    this.events = [];
    this.loggers = [];
    this.cooldowns = new Map();

    // Prototype extensions
    this.log = botLogger;
    this.createEmbed = createEmbed;
    this.editEmbed = editEmbed;
    this.convertHex = convertHex;
    this.tagUser = tagUser;

    // Handlers & functions
    this.args = new Args(this);
    this.db = new RethinkProvider(this);
    this.localeSystem = new LocaleSystem(LOCALES_DIRECTORY);

    this.connect();
    this.editStatus("idle");
    this.once("ready", () => this.readyListener());
  }

  // Runs when the bot is ready
  async readyListener() {
    await loadItems(this);
    switchStatuses(this);
    if (config.apikeys.sentry) this.initializeSentry();
    this.log.info(`Logged in as ${this.tagUser(this.user)} on ${this.guilds.size} guilds`);
    this.log.info(`${this.commands.length} commands loaded`);
    this.log.info(`${this.events.length} events loaded`);
  }

  // Initializes sentry
  initializeSentry() {
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
}
