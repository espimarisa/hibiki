/**
 * @fileoverview Loader
 * @description Loads commands, events, and extensions
 * @module loader
 */

const { readdirSync, statSync } = require("fs");
const path = require("path");

const command_directory = path.join(__dirname, "../commands");
const event_directory = path.join(__dirname, "../events");
const extension_directory = path.join(__dirname, "../extensions");
const logger_directory = path.join(__dirname, "../loggers");

/**
 * Loads any commands
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.commands(this.bot);
 */

module.exports.commands = async function loadCommands(bot) {
  const files = readdirSync(command_directory);
  files.forEach(subfolder => {
    const stats = statSync(`${command_directory}/${subfolder}`);
    if (!stats.isDirectory) return;
    const cmds = readdirSync(`${command_directory}/${subfolder}`);

    // Loads commands
    cmds.forEach(cmd => {
      let command;
      try {
        command = require(`${command_directory}/${subfolder}/${cmd}`);
      } catch (err) {
        bot.log(`${cmd} failed to load: ${err}`);
      }

      // Adds commands
      if (!command) return;
      const _command = new command(bot, subfolder, /(.{1,})\.js/.exec(cmd)[1]);
      if (!_command.requiredkeys.every(k => Object.keys(bot.key).includes(k) && bot.key[k])) return;
      bot.commands.push(_command);
    });
  });

  bot.log.info(`${bot.commands.length} commands loaded`);
};

/**
 * Loads any events
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.events(this.bot);
 */

module.exports.events = async function loadEvents(bot) {
  const files = readdirSync(event_directory);
  files.forEach(evnt => {
    let event;
    try {
      event = require(`${event_directory}/${evnt}`);
    } catch (err) {
      bot.log(`${evnt} failed to load: ${err}`);
    }

    // Adds events; runs them
    bot.events.push(new event(bot, /(.{1,})\.js/.exec(evnt)[1]));
    event = bot.events.find(e => e.id === evnt.split(".js")[0]);
    bot.on(event.name, (arg1, arg2) => {
      event.run(arg1, arg2);
    });
  });

  bot.log.info(`${bot.events.length} events loaded`);
};

/**
 * Loads any extensions on first start
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.extensions(this.bot);
 */

module.exports.extensions = async function loadExtensions(bot) {
  const files = readdirSync(extension_directory);
  files.forEach(ext => {
    let extension;
    if (ext.isDirectory) return;
    if (!ext.endsWith(".ext.js")) return;
    try {
      extension = require(`${extension_directory}/${ext}`);
    } catch (err) {
      bot.log(`${ext} failed to load: ${err}`);
    }

    if (!extension) return;
    if (typeof extension === "function") bot.extensions.push(extension);
  });

  // Loads extensions; runs
  if (process.uptime() < 20) {
    require("../webserver/app")(bot);
    require("../webserver/voting")(bot);
    bot.extensions.forEach(e => e(bot));
    bot.log.info(`${bot.extensions.length} extensions loaded`);
  }
};

/**
 * Loads any loggers
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.loggers(this.bot);
 */

module.exports.loggers = async function loadLoggers(bot) {
  const files = readdirSync(logger_directory);
  files.forEach(l => {
    let logger;
    try {
      logger = require(`${logger_directory}/${l}`);
      logger(bot, bot.db, /(.{1,})\.js/.exec(logger));
    } catch (err) {
      bot.log(`Logger ${l} failed to load: ${err}`);
    }

    bot.loggers.push(logger);
    if (!logger) return;
  });

  bot.log.info(`${bot.loggers.length} loggers loaded`);
};

/**
 * Loads all items
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.all(this.bot);
 */

module.exports.all = async function loadAll(bot) {
  this.commands(bot);
  this.events(bot);
  this.loggers(bot);
  this.extensions(bot);
};
