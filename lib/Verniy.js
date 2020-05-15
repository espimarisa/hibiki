/*
  Main client; loads commands, events, extensions.
*/

const { Client, Collection } = require("eris");
const { readdir } = require("fs");
const { version } = require("../package");
const argParser = require("../lib/utils/Args.js");
const Command = require("./structures/Command");
const Event = require("./structures/Event");
const sentry = require("@sentry/node");
const starttime = new Date();

class Verniy extends Client {
  // Client constructor
  constructor(token, erisOptions, db) {
    super(token, erisOptions);
    this.version = version;
    this.cfg = require("../cfg").cfg;
    this.key = require("../cfg").keys;
    this.embed = require("./Embed");
    this.log = require("./Log");
    this.db = db;
    this.argParser = new argParser(this);
    this.commands = new Collection(Command);
    this.events = new Collection(Event);
    this.extensions = [];
    this.antiSpam = [];
    this.snipeData = {};
    // Logs when ready
    this.once("ready", () => {
      // Logs number of cmds, events, extensions
      this.log.success(`${this.commands.size} commands loaded`);
      this.log.success(`${this.events.size} events loaded`);
      if (process.uptime() < 10) {
        this.extensions.forEach(e => e(this));
        this.log.success(`${this.extensions.length} extensions loaded`);
      }
      // Logs user/startup; sets status
      this.log.success(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`);
      this.log.success(`Startup took ${new Date(new Date() - starttime).getSeconds()}.${new Date(new Date() - starttime).getMilliseconds()} seconds`);
      this.editStatus("online", { name: `${this.guilds.size} servers`, type: 3 });
    });
    // Initializes Sentry
    try { sentry.init({ dsn: this.key.dsn }); } catch (e) { this.log.error(`Sentry failed to Initialize: ${e}`); }
  }


  // Command loader
  loadCommands(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all commands
    readdir(path, { withFileTypes: true }, (_e, items) => {
      items.forEach(item => {
        if (!item.isDirectory()) return;
        readdir(`${path}/${item.name}`, {}, (_e, cmds) => {
          cmds.forEach(cmd => {
            let command;
            try {
              // Tries to load each command
              command = require(`${path}/${item.name}/${cmd}`);
            } catch (e) {
              sentry.captureException(e);
              this.log.error(`Failed to load ${cmd}: ${e}`);
            }
            if (!command) return;
            // Loads the commands; ignores commands with missing requiredkeys
            const _command = new command(this, item.name, /(.{1,})\.js/.exec(cmd)[1]);
            if (!_command.requiredkeys.every(k => Object.keys(this.key).includes(k) && this.key[k])) return;
            this.commands.add(_command);
          });
        });
      });
    });
  }

  // Event loader
  loadEvents(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all events
    readdir(path, (_e, events) => {
      events.forEach(item => {
        let event;
        try {
          // Tries to load each event
          event = require(`${path}/${item}`);
        } catch (e) {
          sentry.captureException(e);
          this.log.error(`Failed to load ${item}: ${e}`);
        }
        if (!event) return;
        // Loads the events
        this.events.add(new event(this, /(.{1,})\.js/.exec(item)[1]));
        event = this.events.find(e => e.id === /(.{1,})\.js/.exec(item)[1]);
        // Runs the events
        const eargs = (arg1, arg2, arg3, arg4) => { event.run(arg1, arg2, arg3, arg4); };
        this.on(event.name, eargs);
      });
    });
  }

  // Extension loader
  loadExtensions(path) {
    if (!path.startsWith(process.cwd())) path = `${process.cwd()}/${path}`;
    readdir(path, { withFileTypes: true }, (_e, extensions) => {
      extensions.forEach(extension => {
        if (extension.isDirectory()) return this.loadExtensions(`${path}/${extension.name}`);
        // Extensions should end with .ext.js
        if (!extension.name.endsWith(".ext.js")) return;
        let ext;
        try {
          ext = require(`${path}/${extension.name}`);
          extensions.push(`${path}/${extension.name}`);
        } catch (e) {
          sentry.captureException(e);
          this.log.error(`Failed to load ${extension.name}: ${e}`);
        }
        if (!ext) return;
        // Loads the extension
        if (typeof ext === "function") this.extensions.push(ext);
      });
    });
  }
}

module.exports = Verniy;
