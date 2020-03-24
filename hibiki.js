/*
  Hibiki, a jiktim project.
  © 2020 smolespi & resolved
*/

const { cfg, rethink, token } = require("./cfg");
const db = require("rethinkdbdash")(rethink);
const Verniy = require("./lib/Verniy");

// Sets Eris options & logs into Discord
const bot = new Verniy(token, cfg, db);
bot.connect();
