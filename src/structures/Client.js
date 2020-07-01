/**
 * @fileoverview Client constructor
 * @description Connects to Discord and handles global bot functions
 */

const { Client } = require("eris");
const { r } = require("rethinkdb-ts");
const Args = require("structures/Args");
const config = require("root/config");
const database = require("scripts/database");
const sentry = require("@sentry/node");
const startup = new Date();

class Hibiki extends Client {
  /**
   * Creates a bot instance
   *
   * @example
   * const Hibiki = require("structures/Client");
   * const config = require("root/config");
   * new Hibiki(token, options);
   *
   * @param {string} token Discord bot token from the config file
   * @param {object} [options] Object of Eris options from the config file
   */

  constructor(token, options) {
    super(token, options);
    database.start(this);

    this.config = config.bot;
    this.key = config.keys;
    this.db = r.db(config.rethink.db);

    this.args = new Args(this);
    this.embed = require("utils/embed");
    this.load = require("scripts/loader");
    this.log = require("scripts/logger");
    this.tag = require("utils/format").tag;
    this.version = require("root/package").version;
    this.statuses = require("scripts/statuses");

    this.commands = [];
    this.events = [];
    this.extensions = [];
    this.sniped = {};

    this.connect();
    this.editStatus("idle");
    this.once("ready", () => this.readyListener());
  }

  /** Runs when the bot is ready */
  readyListener() {
    this.load.all(this);
    try { sentry.init({ dsn: this.key.sentry }); } catch (err) { this.log.error(`Sentry failed to start: ${err}`); }
    this.statuses.switch(this);
    this.log.info(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`);
    this.log.info(`Startup took ${new Date(new Date() - startup).getSeconds()}.${new Date(new Date() - startup).getMilliseconds()} seconds`);
  }
}

module.exports = Hibiki;
