/**
 * @file Loader
 * @description Loads commands and registers slash commands
 * @module utils/loader
 */

import type { HibikiClient } from "../classes/Client.js";
import type { CallableHibikiCommand } from "../classes/Command.js";
import type { CallableHibikiEvent, HibikiEvent } from "../classes/Event.js";
import type { ApplicationCommandStructure } from "@projectdysnomia/dysnomia";
import type { PathLike } from "node:fs";
import { moduleFiletypeRegex, slashCommandNameRegex } from "./constants.js";
import { logger } from "./logger.js";
import fs from "node:fs";
import util from "node:util";

/**
 * Loads all commands
 * @param bot Main bot object
 * @param directory The path to search for commands in
 */

export async function loadCommands(bot: HibikiClient, directory: PathLike) {
  const files = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !moduleFiletypeRegex.test(file.name)) continue;
    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> = await import(`file://${directory}/${file.name}`);
      commandToLoad = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Command ${file.name} failed to load: ${util.inspect(error)}`);
      return;
    }

    // Gets the name
    if (!commandToLoad) continue;
    const name = file.name.split(moduleFiletypeRegex)[0].toLowerCase();

    // Creates the command
    const command = new commandToLoad(bot, name);
    bot.commands.set(name, command);
  }
}

/**
 * Loads all events
 * @param bot Main bot object
 * @param directory The path to search for events in
 */

export async function loadEvents(bot: HibikiClient, directory: PathLike) {
  // Loads each event file
  const files = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or subdirectories
    if (file.name.endsWith(".map") || !moduleFiletypeRegex.test(file.name)) continue;
    let eventToLoad: CallableHibikiEvent;

    try {
      const importedEvent: Record<string, CallableHibikiEvent> = await import(`file://${directory}/${file.name}`);
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Event ${file.name} failed to load: ${util.inspect(error)}`);
      return;
    }

    // Gets the name
    if (!eventToLoad) continue;

    // Creates the event
    const name = file.name.split(moduleFiletypeRegex)[0];
    const event = new eventToLoad(bot, name) as HibikiEvent;

    // Pushes the events and runs them
    bot.events.set(name, event);
  }

  // Subscribes to all of the events
  subscribeToEvents(bot, bot.events);
}

/**
 * Registers slash commands with the Discord gateway
 * @param bot Main bot object
 * @param guild A guild ID if editing guild commands
 */

export function registerSlashCommands(bot: HibikiClient, guild?: DiscordSnowflake) {
  if (!bot.user?.id) throw new Error("This really shouldn't happen. How.");
  const jsonData = [];

  for (const command of bot.commands.values()) {
    // Doesn't load messageOnly or ownerOnly commands
    if (command.messageOnly || command.ownerOnly) return;

    // Checks to verify the slash command name
    if (!slashCommandNameRegex.test(command.name)) {
      logger.error("Name is not valid.");
      return;
    }

    jsonData.push(command.toJSON());
  }

  // Registers commands to a specific guild
  if (guild) {
    bot.bulkEditGuildCommands(guild, jsonData as ApplicationCommandStructure[]);
  } else {
    // Registers commands to the entire app
    bot.bulkEditCommands(jsonData as ApplicationCommandStructure[]);
  }
}

/**
 * Subscribes to event listeners and runs them
 * @param bot Main bot object
 * @param events The events to subscribe to
 */

function subscribeToEvents(bot: HibikiClient, events: Map<string, HibikiEvent>) {
  for (const eventToListenOn of events.values()) {
    for (const individualEvent of eventToListenOn.events) {
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run([individualEvent], ...eventParameters));
    }
  }
}
