const { Client, Collection } = require("eris");
const { readdirSync } = require("fs");
/* eslint-disable no-unused-vars */
const Command = require("./Structures/Command")

class Verniy extends Client {
  constructor(token, erisOptions, cfg, db) {
    super(token, erisOptions);
    this.cfg = cfg;
    this.db = db;

    this.log = require("../lib/Log");

    this.commands = new Collection(Command);
    this.loadCommands(`${process.cwd()}/cmds`);
  }

  // Command loader
  loadCommands(path) {
    // Reads the commands directory
    const items = readdirSync(path, { withFileTypes: true });
    items.forEach(item => {
      if (!item.isDirectory()) return;
      const cmds = readdirSync(`${path}/${item.name}`);
      cmds.forEach(cmd => {
        let command;
        try {
          command = require(`${path}/${item.name}/${cmd}`);
        } catch (err) {
          // Logs when a cmd fails to load
          this.log.error(`Failed to load ${cmd}:\n ${err}`)
        }
        if (!command) return;
        // Loads the commands
        this.commands.add(new command(this, cmd.split(".js")[0], item.name));
      });
    });
    this.log.success(`${this.commands.size} commands loaded`);
  }
}

module.exports = Verniy;
