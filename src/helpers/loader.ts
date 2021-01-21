/**
 * @file Loader
 * @description Loads commands, events, and other modules
 * @module helpers/loader
 */

import type { HibikiClient } from "../classes/Client";
import type { Command } from "../classes/Command";
import type { Event } from "../classes/Event";
import { readdir } from "fs";
import path from "path";
import config from "../../config.json";

const COMMANDS_DIRECTORY = path.join(__dirname, "../commands");
const EVENTS_DIRECTORY = path.join(__dirname, "../events");
const LOGGERS_DIRECTORY = path.join(__dirname, "../loggers");
const fileTypes = /\.(js|ts)$/i;
const loadedCommands = {};

// Loads all commands
function loadCommands(path: string, bot: HibikiClient) {
  readdir(path, { withFileTypes: true }, (ioerr, files) => {
    if (ioerr) return;

    files.forEach((file, i) => {
      if (file.isDirectory()) {
        loadedCommands[`${path}/${file.name}`] = false;
        return loadCommands(`${path}/${file.name}`, bot);
      }

      // Tries to import each command
      let command;
      if (!fileTypes.test(file.name)) return;

      try {
        const importedCommand = require(`${path}/${file.name}`);
        command = importedCommand[Object.keys(importedCommand)[0]];
      } catch (err) {
        console.error(err);
        bot.log.error(`Command ${file.name} failed to load: ${err}`);
      }

      if (!command) return;

      // Gets the command to load
      const splitPath = path.split("/");
      const cmd = new command(bot, file.name.split(fileTypes)[0], splitPath[splitPath.length - 1]) as Command;

      // Don't load commands missing requiredkeys
      let cmdMissingKeys = false;
      if (!cmd.requiredkeys.every((k: string) => (Object.keys(config.keys).includes(k) && config.keys[k]) || config.keys.botlists[k])) {
        cmdMissingKeys = true;
      }

      // Pushes the commands
      if (!cmdMissingKeys) bot.commands.push(cmd);

      if (i === files.length - 1) {
        loadedCommands[path] = true;
        if (!Object.values(loadedCommands).includes(false)) bot.log.info(`${bot.commands.length} commands loaded`);
      }
    });
  });
}

// Loads and runs events and loggers
function loadEvents(path: string, bot: HibikiClient, logger = false) {
  // Subscribes to and runs events/loggers
  function subscribeEvents(array: Event[] = []) {
    array.forEach((e: Event) => {
      e.events.forEach((ev: string) => {
        bot.on(ev, (...eventParams: string[]) => e.run(ev, ...eventParams));
      });
    });
  }

  // Loads each event file
  readdir(path, { withFileTypes: true }, (ioerr, files) => {
    if (ioerr) return;

    let i = 0;
    files.forEach((file) => {
      if (file.isDirectory()) return;

      let event;
      if (!fileTypes.test(file.name)) return;

      try {
        const importedEvent = require(`${path}/${file.name}`);
        event = importedEvent[Object.keys(importedEvent)[0]];
        i++;
      } catch (err) {
        console.error(err);
        bot.log.error(`Event ${file.name} failed to load: ${err}`);
      }

      // Pushes the events and runs them
      (logger ? bot.loggers : bot.events).push(new event(bot, file.name.split(fileTypes)[0]));
      if (i === files.length - 1) {
        subscribeEvents(logger ? bot.loggers : bot.events);
        bot.log.info(logger ? `${bot.loggers.length} loggers loaded` : `${bot.events.length} events loaded`);
      }
    });
  });
}

// Loads all items
export async function loadItems(bot: HibikiClient) {
  loadCommands(COMMANDS_DIRECTORY, bot);
  loadEvents(EVENTS_DIRECTORY, bot);
  loadEvents(LOGGERS_DIRECTORY, bot, true);
}
