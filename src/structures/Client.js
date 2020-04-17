/*
  This is the core client for Hibiki, Verniy.
  It handles command loads/unloads & errors.
*/

const { Client, Collection } = require("eris");
const { readdir } = require("fs");
const Command = require("./structures/Command")
const Event = require("./structures/Event")
const starttime = new Date();

// todo - move Echo to a npm package
// Echo logs & handles errors
// const echo = require("../../Echo/sdk/index");
// echo.setSettings(require("../cfg").echo);
// echo.init();

class Verniy extends Client {
  // Client constructor
  constructor(token, erisOptions, db) {
    super(token, erisOptions);
    this.cfg = require("../cfg.json").cfg;
    this.key = require("../cfg.json").keys;
    this.embed = require("./Embed")
    this.log = require("./Log");
    this.db = db;
    this.commands = new Collection(Command);
    this.events = new Collection(Event);
    this.extensions = [];
    let argParser = require("../lib/utils/Args.js");
    this.argParser = new argParser(this);
    // Logs when ready
    this.on("ready", async () => {
      // Logs number of cmds, events, extensions
      this.log.success(`${this.commands.size} commands loaded`);
      this.log.success(`${this.events.size} events loaded`);
      this.log.success(`${this.extensions.length} extensions loaded`);
      // Logs user & startup time
      this.log.success(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`);
      this.log.success(`Startup took ${new Date(new Date() - starttime).getSeconds()}.${new Date(new Date() - starttime).getMilliseconds()} seconds`)
      this.editStatus("online", { name: `${this.guilds.size} servers`, type: 3 });
    });
  }

  // Command loader
  loadCommands(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all commands
    readdir(path, { withFileTypes: true }, (err, items) => {
      items.forEach(item => {
        if (!item.isDirectory()) return;
        readdir(`${path}/${item.name}`, {}, (_err, cmds) => {
          cmds.forEach(cmd => {
            let command;
            try {
              // Tries to load each command
              command = require(`${path}/${item.name}/${cmd}`);
            } catch (err) {
              this.log.error(`Failed to load ${cmd}: ${err}`);
            }
            if (!command) return;
            // Loads the commands
            this.commands.add(new command(this, item.name, cmd.split(".js")[0]));
          });
        });
      });
    });
  }

  // Event loader
  loadEvents(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all events
    readdir(path, {}, (err, events) => {
      events.forEach(item => {
        let event;
        try {
          // Tries to load each event
          event = require(`${path}/${item}`);
        } catch (err) {
          this.log.error(`Failed to load ${item}: ${err}`);
        }
        if (!event) return;
        // Loads the events
        this.events.add(new event(this, item.split(".js")[0]));
        event = this.events.find(e => e.id === item.split(".js")[0]);
        // Runs the events
        let eargs = (arg1, arg2, arg3, arg4, arg5) => { event.run(arg1, arg2, arg3, arg4, arg5) };
        this.on(event.name, eargs);
      });
    });
  }

  // Extension loader
  loadExtensions(path) {
    if (!path.startsWith(process.cwd())) path = `${process.cwd()}/${path}`;
    readdir(path, { withFileTypes: true }, (err, extensions) => {
      extensions.forEach(extension => {
        if (extension.isDirectory()) return this.loadExtensions(`${path}/${extension.name}`);
        if (!extension.name.endsWith(".js")) return;
        let ext;
        try {
          ext = require(`${path}/${extension.name}`);
          extensions.push(`${path}/${extension.name}`);
        } catch (err) {
          this.log.error(`Failed to load ${extension.name}: ${err}`);
        }
        if (!ext) return;
        // Loads the extension
        if (typeof ext === "function" && ext.extload === true) ext(this);
      });
    });
  }
}

module.exports = Verniy;
