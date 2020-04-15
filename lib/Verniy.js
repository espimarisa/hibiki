/*
  This is the core client for Hibiki, Verniy.
  It handles command loads/unloads & errors.
*/

const { Client, Collection } = require("eris");
const { readdirSync } = require("fs");
const Command = require("./structures/Command")
const Event = require("./structures/Event")

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
    let argParser = require("../lib/utils/Args.js");
    this.argParser = new argParser(this);
    // Logs when ready
    this.on("ready", async () => {
      this.log.success(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`)
      this.editStatus("online", { name: `${this.guilds.size} servers`, type: 3 });
    });
  }

  // Command loader
  loadCommands(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all commands
    const items = readdirSync(path, { withFileTypes: true });
    items.forEach(item => {
      if (!item.isDirectory()) return;
      const cmds = readdirSync(`${path}/${item.name}`);
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
    // Logs how many commands are loaded
    this.log.success(`${this.commands.size} commands loaded`);
  }

  // Event loader
  loadEvents(path) {
    path = `${process.cwd()}/${path}`;
    // Looks for all events
    const events = readdirSync(path);
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
    // Logs how many events are loaded
    this.log.success(`${this.events.size} events loaded`);
  }
}

module.exports = Verniy;
