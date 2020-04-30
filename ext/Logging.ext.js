/*
  This loads any loggers.
*/

module.exports = (bot, db) => {
  this.bot = bot;
  this.db = db;
  require("fs").readdir(`${__dirname}/loggers`, (_err, files) => {
    files.forEach(l => {
      let logger;
      try {
        // Tries to load each logger
        logger = require(`${__dirname}/loggers/${l}`);
      } catch (err) {
        // Logs if a logger couldn't be loaded
        this.bot.log.error(`Error while loading logger ${l}: ${err}`);
      }
      if (!logger) return;
    });
  });
};
