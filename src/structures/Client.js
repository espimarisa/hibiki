/*
  This is the core client for Hibiki.
  It loads commands, events, and extensions.
*/

const { Client, Collection } = require("eris");
const { readdir } = require("fs");
const argParser = require("../lib/utils/Args.js");
const Command = require("./structures/Command");
const Event = require("./structures/Event");
const sentry = require("@sentry/node");
const starttime = new Date();

class Verniy extends Client {
  // Client constructor
  constructor(token, erisOptions, db) {
    super(token, erisOptions);
    this.cfg = require("../cfg").cfg;
    this.key = require("../cfg").keys;
    this.embed = require("./Embed");
    this.log = require("./Log");
    this.db = db;
    this.argParser = new argParser(this);
    this.commands = new Collection(Command);
    this.events = new Collection(Event);
    this.extensions = [];
    // Logs when ready
    this.on("ready", () => {
      // Logs number of cmds, events, extensions
      this.log.success(`${this.commands.size} commands loaded`);
      this.log.success(`${this.events.size} events loaded`);
      this.extensions.forEach(e => e(this));
      this.log.success(`${this.extensions.length} extensions loaded`);
      // Logs user/startup; sets status
      this.log.success(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`);
      this.log.success(`Startup took ${new Date(new Date() - starttime).getSeconds()}.${new Date(new Date() - starttime).getMilliseconds()} seconds`);
      this.editStatus("online", { name: `${this.guilds.size} servers`, type: 3 });
    });
    // Initializes Sentry
    try { sentry.init({ dsn: this.key.dsn }); } catch (err) { this.log.error(`Sentry failed to Initialize: ${err}`); }
  }


  // Command loader
  loadCommands(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all commands
    readdir(path, { withFileTypes: true }, (_err, items) => {
      items.forEach(item => {
        if (!item.isDirectory()) return;
        readdir(`${path}/${item.name}`, {}, (_err, cmds) => {
          cmds.forEach(cmd => {
            let command;
            try {
              // Tries to load each command
              command = require(`${path}/${item.name}/${cmd}`);
            } catch (err) {
              sentry.captureException(err);
              this.log.error(`Failed to load ${cmd}: ${err}`);
            }
            if (!command) return;
            // Loads the commands; ignores commands with missing requiredkeys
            const _command = new command(this, item.name, /(.{1,})\.js/.exec(cmd)[1]);
            if (_command.requiredkeys.map(k => k && this.key[k].length > 0).includes(false)) return;
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
    readdir(path, (_err, events) => {
      events.forEach(item => {
        let event;
        try {
          // Tries to load each event
          event = require(`${path}/${item}`);
        } catch (err) {
          sentry.captureException(err);
          this.log.error(`Failed to load ${item}: ${err}`);
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
    readdir(path, { withFileTypes: true }, (_err, extensions) => {
      extensions.forEach(extension => {
        if (extension.isDirectory()) return this.loadExtensions(`${path}/${extension.name}`);
        // Extensions should end with .ext.js
        if (!extension.name.endsWith(".ext.js")) return;
        let ext;
        try {
          ext = require(`${path}/${extension.name}`);
          extensions.push(`${path}/${extension.name}`);
        } catch (err) {
          sentry.captureException(err);
          this.log.error(`Failed to load ${extension.name}: ${err}`);
        }
        if (!ext) return;
        // Loads the extension
        if (typeof ext === "function") this.extensions.push(ext);
      });
    });
  }
}

module.exports = Verniy;
