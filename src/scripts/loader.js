/**
 * @fileoverview Loader
 * @description Loads commands, events, loggers, scripts, and webservers.
 * @module loader
 */

const { readdirSync, statSync } = require("fs");
const path = require("path");

const command_directory = path.join(__dirname, "../commands");
const event_directory = path.join(__dirname, "../events");
const logger_directory = path.join(__dirname, "../loggers");
const script_directory = path.join(__dirname, "../scripts");
const webserver_directory = path.join(__dirname, "../webserver");

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
        if (cmd.isDirectory || !cmd.endsWith(".js")) return;
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
      if (evnt.isDirectory || !evnt.endsWith(".js")) return;
      event = require(`${event_directory}/${evnt}`);
    } catch (err) {
      bot.log(`${evnt} failed to load: ${err}`);
    }

    // Adds events; runs them
    bot.events.push(new event(bot, /(.{1,})\.js/.exec(evnt)[1]));
    event = bot.events.find(e => e.id === evnt.split(".js")[0]);
    bot.on(event.name, (arg1, arg2, arg3, arg4, arg5) => {
      event.run(arg1, arg2, arg3, arg4, arg5);
    });
  });

  bot.log.info(`${bot.events.length} events loaded`);
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
      if (l.isDirectory || !l.endsWith(".js")) return;
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
 * Loads any bot scripts
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.scripts(this.bot);
 */

module.exports.scripts = async function loadScripts(bot) {
  const files = readdirSync(script_directory);
  files.forEach(s => {
    let script;
    if (s.isDirectory || s.endsWith(".js")) return;
    try {
      script = require(`${script_directory}/${s}`)(bot);
    } catch (err) {
      bot.log(`${s} failed to load: ${err}`);
    }

    if (!script) return;
  });
};

/**
 * Loads any webservers on first start
 * @param {object} bot Main bot object
 *
 * @example
 * const load = require("../scripts/loader");
 * load.webservers(this.bot);
 */

module.exports.webservers = async function loadWeb(bot) {
  // Loads web if first boot
  if (process.uptime() < 20) {
    const files = readdirSync(webserver_directory);
    files.forEach(w => {
      if (w.isDirectory || !w.endsWith(".js")) return;
      let server;
      try {
        server = require(`${webserver_directory}/${w}`);
        server(bot);
      } catch (err) {
        bot.log(`Webserver ${w} failed to load: ${err}`);
      }
    });
  }
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
  this.scripts(bot);
  this.webservers(bot);
};
