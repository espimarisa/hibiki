/**
 * @file Client
 * @description Connects to Discord and handles global functions
 */

import type { Command } from "./Command";
import type { Event } from "./Event";
import type { Logger } from "./Logger";
import { Args } from "./Args";
import { Lavalink } from "./Lavalink";
import { LocaleSystem } from "./Locale";
import { RethinkProvider } from "./RethinkDB";
import { convertHex, createEmbed, editEmbed } from "../helpers/embed";
import { botCount } from "../helpers/botcount";
import { tagUser } from "../helpers/format";
import { loadItems } from "../helpers/loader";
import { botLogger } from "../helpers/logger";
import { switchStatuses } from "../helpers/statuses";
import Eris, { Client } from "eris";
import { join } from "path";
import config from "../../config.json";
import Sentry from "@sentry/node";

const LOCALES_DIRECTORY = join(__dirname, "../locales");

export class HibikiClient extends Client {
  commands: Array<Command> = [];
  events: Array<Event> = [];
  loggers: Array<Logger> = [];
  cooldowns: Map<string, unknown>;
  tagUser: typeof tagUser;
  lavalink: Lavalink;
  localeSystem: LocaleSystem;
  args: Args;
  db: RethinkProvider;
  log: typeof botLogger;

  constructor(token: string, options: Record<string, unknown>) {
    super(token, options);
    // Prototype extensions
    Eris.Message.prototype.createEmbed = createEmbed;
    Eris.Message.prototype.editEmbed = editEmbed;
    Eris.Message.prototype.convertHex = convertHex;
    Object.defineProperty(Eris.Guild.prototype, "botCount", {
      get: botCount,
    });

    // Collections
    this.commands = [];
    this.events = [];
    this.loggers = [];
    this.cooldowns = new Map();

    // Handlers & functions
    this.log = botLogger;
    this.tagUser = tagUser;
    this.args = new Args(this);
    this.db = new RethinkProvider();
    this.lavalink = new Lavalink(this);
    this.localeSystem = new LocaleSystem(LOCALES_DIRECTORY);

    this.connect();
    this.editStatus("idle");
    this.once("ready", () => this.readyListener());
  }

  // Runs when the bot is ready
  async readyListener() {
    await loadItems(this);
    switchStatuses(this);
    if (config.keys.sentry) this.initializeSentry();
    if (config.lavalink.enabled) this.lavalink.manager.init(this.user.id);
    this.log.info(`Logged in as ${this.tagUser(this.user)} on ${this.guilds.size} guilds`);
  }

  // Initializes sentry
  initializeSentry() {
    try {
      Sentry.init({
        dsn: config.keys.sentry,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.5,
      });
    } catch (err) {
      this.log.error(`Sentry failed to initialize: ${err}`);
    }
  }
}
