/**
 * @file Loader
 * @description Loads commands, events, and other modules
 * @module helpers/loader
 */

import type { HibikiClient } from "../classes/Client";
import { readdir } from "fs";
import { join } from "path";

const COMMANDS_DIRECTORY = join(__dirname, "../commands");
const EVENTS_DIRECTORY = join(__dirname, "../events");
const fileTypes = /\.(js|ts)$/i;
const loadedCommands = {};

/** Loads all commands */
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
        bot.log.error(`Command ${file.name} failed to load: ${err}`);
      }

      if (!command) return;

      // Pushes the commands
      const splitPath = path.split("/");
      bot.commands.push(new command(bot, file.name.split(fileTypes)[0], splitPath[splitPath.length - 1]));

      if (i === files.length - 1) {
        loadedCommands[path] = true;
        if (!Object.values(loadedCommands).includes(false)) bot.log.info(`${bot.commands.length} commands loaded`);
      }
    });
  });
}

/** Loads and runs events */
function loadEvents(path: string, bot: HibikiClient) {
  // Subscribes to and runs events
  function subscribeEvents() {
    bot.events.forEach((e: any) => {
      e.events.forEach((ev: string) => {
        bot.on(ev, (...eventParams: any) => e.run(ev, ...eventParams));
      });
    });
  }

  // Loads each event file
  readdir(EVENTS_DIRECTORY, { withFileTypes: true }, (ioerr, files) => {
    if (ioerr) return;

    files.forEach((file, i) => {
      if (file.isDirectory()) return;

      let event;
      if (!fileTypes.test(file.name)) return;

      try {
        const importedEvent = require(`${path}/${file.name}`);
        event = importedEvent[Object.keys(importedEvent)[0]];
      } catch (err) {
        bot.log.error(`Event ${file.name} failed to load: ${err}`);
      }

      // Pushes the events and runs them
      bot.events.push(new event(bot, file.name.split(fileTypes)[0]));
      if (i === files.length - 1) {
        subscribeEvents();
        bot.log.info(`${bot.events.length} events loaded`);
      }
    });
  });
}

/** Loads all items */
export async function loadItems(bot: HibikiClient) {
  loadCommands(COMMANDS_DIRECTORY, bot);
  loadEvents(EVENTS_DIRECTORY, bot);
}
