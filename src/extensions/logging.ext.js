/*
  This loads any loggers.
*/

module.exports = (bot, db) => {
  // Looks for loggers
  require("fs").readdir(`${__dirname}/loggers`, (_e, files) => {
    files.forEach(l => {
      let logger;
      try {
        // Tries to load each logger
        logger = require(`${__dirname}/loggers/${l}`);
        logger(bot, db);
      } catch (e) {
        // Logs if a logger couldn't be loaded
        bot.log.error(`Error while loading logger ${l}: ${e}`);
      }
      if (!logger) return;
    });
  });
};
