/*
  Verniy Core Client
  © 2020 smolespi & resolved
  github.com/smolespi/Verniy
*/

const { Client, Collection } = require("eris");
const { readdirSync } = require("fs");
const Command = require("./structures/Command")
const Event = require("./structures/Event")

// Client constructor
class Verniy extends Client {
  constructor(token, erisOptions, db) {
    super(token, erisOptions);
    // Sets this.cfg to the config array
    this.cfg = require("../cfg").config;
    this.embed = require("./Embed")
    this.log = require("./Log");

    this.db = db;

    this.commands = new Collection(Command);
    this.events = new Collection(Event);
    // Logs when ready
    this.on("ready", async () => {
      this.log.success(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} servers`)
      // Sets the status
      this.editStatus("online", { name: `${this.guilds.size} servers`, type: 3 });
    });
  }

  // Command loader
  loadCommands(path) {
    path = `${process.cwd()}/${path}`;
    // Reads the commands directory
    const items = readdirSync(path, { withFileTypes: true });
    items.forEach(item => {
      if (!item.isDirectory()) return;
      // Gets the commands
      const cmds = readdirSync(`${path}/${item.name}`);
      cmds.forEach(cmd => {
        let command;
        // Tries to load each command
        try {
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
    // Reads the events directory
    const events = readdirSync(path);
    events.forEach(item => {
      let event;
      // Tries to load each event
      try {
        event = require(`${path}/${item}`);
      } catch (err) {
        this.log.error(`Failed to load ${item}: ${err}`);
      }
      if (!event) return;
      // Loads the events
      this.events.add(new event(this, item.split(".js")[0]));
      event = this.events.find(e => e.id == item.split(".js")[0]);
      // Runs the event
      this.on(event.name, (arg1, arg2) => {
        event.run(arg1, arg2);
      });
    });
    // Logs how many events are loaded
    this.log.success(`${this.events.size} events loaded`);
  }
}

module.exports = Verniy;
