/**
 * @fileoverview Client constructor
 * @description Connects to Discord and handles global bot functions
 */

const { Client } = require("eris");
const { r } = require("rethinkdb-ts");
const Args = require("./Args");
const config = require("../../config");
const load = require("../scripts/loader");
const statuses = require("../scripts/statuses");
const setup = require("../scripts/setup");
const sentry = require("@sentry/node");
const startup = new Date();

class Hibiki extends Client {
  /**
   * Creates a bot instance
   *
   * @example
   * const Hibiki = require("../structures/Client");
   * const config = require("../config");
   * new Hibiki(token, options);
   *
   * @param {string} token Discord bot token from the config file
   * @param {object} [options] Object of Eris options from the config file
   */

  constructor(token, options) {
    super(token, options);

    this.config = config.bot;
    this.key = config.keys;
    this.db = r.db(config.rethink.db);

    this.args = new Args(this);
    this.embed = require("../utils/embed");
    this.log = require("../scripts/logger");
    this.tag = require("../utils/format").tag;
    this.version = require("../../package").version;

    this.antiSpam = [];
    this.cooldowns = [];
    this.commands = [];
    this.events = [];
    this.loggers = [];
    this.snipeData = {};

    this.connect();
    this.editStatus("idle");
    this.once("ready", () => this.readyListener());
  }

  /** Runs when the bot is ready */
  async readyListener() {
    await setup();
    load.all(this);
    statuses.switch(this);
    try { sentry.init({ dsn: this.key.sentry }); } catch (err) { this.log.error(`Sentry failed to start: ${err}`); }
    this.log.info(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`);
    this.log.info(`Startup took ${new Date(new Date() - startup).getSeconds()}.${new Date(new Date() - startup).getMilliseconds()} seconds`);
  }
}

module.exports = Hibiki;
