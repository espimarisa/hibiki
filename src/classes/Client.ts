/**
 * @file Client
 * @description Connects to Discord and handles global functions
 */

import type { ClientOptions } from "eris";

import type { Command } from "./Command";
import type { Event } from "./Event";
import type { Logger } from "./Logger";

import Eris, { Client } from "eris";

import { Args } from "./Args";
import { Lavalink } from "./Lavalink";
import { LocaleSystem } from "./Locale";
import { RethinkProvider } from "./RethinkDB";
import { HibikiExtensionEnvironmentProvider } from "../extensions/ExtensionEnvironmentProvider";
import { InviteHandler } from "../scripts/invites";
import { MonitorHandler } from "../scripts/monitors";
import { MuteHandler } from "../scripts/mutes";
import { ReminderHandler } from "../scripts/reminders";
import { loadItems } from "../scripts/loader";
import { convertHex, createEmbed, editEmbed } from "../utils/embed";
import { tagUser } from "../utils/format";
import { logger } from "../utils/logger";
import { rotateStatuses } from "../utils/statuses";
import { startWebserver } from "../webserver/index";

import Sentry from "@sentry/node";
import path from "path";

import config from "../../config.json";

const LOCALES_DIRECTORY = path.join(__dirname, "../locales");

export class HibikiClient extends Client {
  readonly antiSpam: AntiSpam[] = [];
  readonly args: Args;
  readonly commands: Array<Command> = [];
  readonly config: typeof config = config;
  readonly cooldowns: Map<string, Date> = new Map();
  readonly db: RethinkProvider = new RethinkProvider();
  readonly events: Array<Event> = [];
  readonly extensionEnvProvider?: HibikiExtensionEnvironmentProvider;
  readonly inviteHandler: InviteHandler;
  readonly lavalink: Lavalink;
  readonly localeSystem: LocaleSystem;
  readonly log: typeof logger = logger;
  readonly loggers: Array<Logger> = [];
  logs: BotLogs[] = [];
  readonly monitorHandler: MonitorHandler;
  readonly muteHandler: MuteHandler;
  readonly reminderHandler: ReminderHandler;
  readonly snipeData: SnipeData = {};

  constructor(token: string, options: ClientOptions) {
    super(token, options);

    // Prototype extensions
    Eris.Message.prototype.createEmbed = createEmbed;
    Eris.Message.prototype.editEmbed = editEmbed;
    Eris.Message.prototype.convertHex = convertHex;
    Eris.Message.prototype.tagUser = tagUser;

    // Handlers & functions
    this.args = new Args(this);
    this.lavalink = new Lavalink(this);
    this.localeSystem = new LocaleSystem(this, LOCALES_DIRECTORY);
    this.inviteHandler = new InviteHandler(this);
    this.monitorHandler = new MonitorHandler(this);
    this.muteHandler = new MuteHandler(this);
    this.reminderHandler = new ReminderHandler(this);
    this.requestHandler = new Eris.RequestHandler(this);

    // Extension shit, only running in dev environment atm
    if (this.config?.extensions?.enabled && process.env["NODE_ENV"] === "dev")
      this.extensionEnvProvider = new HibikiExtensionEnvironmentProvider(this);

    this.editStatus("idle");
    this.once("ready", async () => {
      loadItems(this);
      rotateStatuses(this);

      // Enables sentry
      if (config.sentry) {
        try {
          Sentry.init({
            dsn: config.sentry,
            environment: process.env.NODE_ENV,
            release: process.env.npm_package_version,
            tracesSampleRate: 0.5,
            maxBreadcrumbs: 50,
            attachStacktrace: true,
          });
        } catch (err) {
          this.log.error(`Sentry failed to initialize: ${err}`);
        }
      }

      // Enables lavalink
      if (config.lavalink?.enabled) this.lavalink.manager.init(this.user.id);

      if (config.dashboard?.port && config.dashboard?.botSecret && config.dashboard?.redirectURI) startWebserver(this);

      this.log.info(`Loaded ${this.commands.length} commands`);
      this.log.info(`Loaded ${this.events.length} events`);
      this.log.info(`Loaded ${this.loggers.length} loggers`);
      this.log.info(`Loaded ${Object.keys(this.localeSystem.locales).length} locales`);
      this.log.info(
        `Logged in as ${tagUser(this.user)}, serving ${this.guilds.size} guilds with ${this.users.size} users through ${this.gatewayURL}`,
      );

      if (this.extensionEnvProvider) this.extensionEnvProvider.createEnvironment("0").runNewTestExtension();

      this.on("ready", () =>
        this.log.info(`Reconnected to Discord (${this.gatewayURL}) - now serving ${this.guilds.size} guilds with ${this.users.size} users`),
      );
    });

    if (!config.disableAutoReconnect) this.on("disconnect", this.connect);
    this.connect();
  }
}
