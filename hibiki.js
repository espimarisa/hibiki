/*
  Hibiki © 2020 smolespi & resolved.
  Code licensed under the GNU AGPL v3.
*/

const { cfg, options, rethink } = require("./cfg");
const db = require("rethinkdbdash")(rethink);
const Verniy = require("./lib/Verniy");

// Sets Eris options & creates an instance
const bot = new Verniy(cfg.token, options, db);

// Loads commands & events
bot.loadCommands("cmds");
bot.loadEvents("events");
bot.loadThings("ext");

// Logs into Discord
bot.connect();
