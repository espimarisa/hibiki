/**
 * @file Loader
 * @description Loads commands, events, locales, and other modules
 * @author Espi <contact@espi.me>
 * @module scripts/loader
 */

import { hibikiClient } from "../structures/Client";
import { readdirSync, statSync } from "fs";
import path from "path";

const COMMANDS_DIRECTORY = path.join(__dirname, "../commands");
const EVENTS_DIRECTORY = path.join(__dirname, "../events");

/**
 * Loads all items
 * @param {hibikiClient} bot Main bot object
 * @async
 */

export async function loadItems(bot: hibikiClient): Promise<void> {
  // Filetypes to try to load
  const fileTypes = /\.(js|ts|json)$/i;

  // Loads commands
  const commandFiles = readdirSync(COMMANDS_DIRECTORY);
  commandFiles.forEach((subfolder) => {
    const stats = statSync(`${COMMANDS_DIRECTORY}/${subfolder}`);
    if (!stats.isDirectory) return;

    const commands = readdirSync(`${COMMANDS_DIRECTORY}/${subfolder}`);

    // Tries to load each command
    commands.forEach(async (cmd) => {
      let command;

      try {
        if (!fileTypes.test(cmd)) return;
        command = await require(`${COMMANDS_DIRECTORY}/${subfolder}/${cmd}`);
      } catch (err) {
        bot.log.error(`Command ${cmd} failed to load: ${err}`);
      }

      if (!command) return;
      bot.commands.push(command.default);
    });
  });

  // Tries to load each event
  const eventFiles = readdirSync(EVENTS_DIRECTORY);
  eventFiles.forEach(async (e) => {
    let event;

    try {
      if (!fileTypes.test(e)) return;
      event = await require(`${EVENTS_DIRECTORY}/${e}`);
    } catch (err) {
      bot.log.error(`Event ${e} failed to load: ${err}`);
    }

    if (!event) return;
    bot.events.push(event.default);
  });
}
