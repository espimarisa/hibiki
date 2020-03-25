/*
  Hibiki, based on the Verniy core.
  © 2018 - 2020 smolespi & resolved

  github.com/smolespi/Hibiki
  github.com/smolespi/Verniy
*/

const { cfg, rethink, token } = require("./cfg");
const db = require("rethinkdbdash")(rethink);
const Verniy = require("./lib/Verniy");

// Sets Eris options & creates an instance
const bot = new Verniy(token, cfg, db);

// Loads commands & events
bot.loadCommands("cmds");
bot.loadEvents("events");

// Logs into Discord
bot.connect();
