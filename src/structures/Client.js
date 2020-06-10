/**
 * @fileoverview Client
 * @description Connects to Discord & sets globals
 */

const { Client } = require("eris");
const { r } = require("rethinkdb-ts");
const Args = require("structures/Args");
const config = require("root/config");
const database = require("scripts/database");
const sentry = require("@sentry/node");
const startup = new Date();

/**
 * Main bot constructor
 * @param {String} token Bot token
 * @param {Object} options List of Eris options
 */

class Verniy extends Client {
  constructor(token, options) {
    super(token, options);
    database.start();

    this.config = config.bot;
    this.key = config.keys;
    this.db = r.db(config.rethink.db);

    this.args = new Args(this);
    this.embed = require("utils/embed");
    this.load = require("scripts/loader");
    this.log = require("scripts/logger");
    this.version = require("root/package").version;
    this.statuses = require("scripts/statuses");

    this.commands = [];
    this.events = [];
    this.extensions = [];
    this.load.all(this);

    this.connect();
    this.editStatus("idle");
    this.once("ready", () => this.readyListener());
  }

  readyListener() {
    try { sentry.init({ dsn: this.key.sentry }); } catch (err) { this.log.error(`Sentry failed to start: ${err}`); }
    this.statuses.switch(this);
    this.log.info(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`);
    this.log.info(`Startup took ${new Date(new Date() - startup).getSeconds()}.${new Date(new Date() - startup).getMilliseconds()} seconds`);
  }
}

module.exports = Verniy;
