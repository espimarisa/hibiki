/**
 * @file Loader
 * @description Loads commands, events, and loggers; registers slash commands
 * @module loader
 */

import type { HibikiClient } from "../classes/Client.js";
import type { CallableHibikiCommand } from "../classes/Command.js";
import type { CallableHibikiEvent, HibikiEvent } from "../classes/Event.js";
import type { HibikiLogger } from "../classes/Logger.js";
import type { Collection } from "discord.js";
import type { PathLike } from "node:fs";
import { moduleFiletypeRegex, slashCommandNameRegex } from "./constants.js";
import { logger } from "./logger.js";
import { checkIntents } from "./validator.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "node:fs";
import path from "node:path";

/**
 * Loads all Hibiki commands
 * @param bot An instance of the Hibiki client to push commands to
 * @param directory The directory to look for commands in
 */

export async function loadCommands(bot: HibikiClient, directory: PathLike): Promise<any> {
  const files = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });

  files.forEach(async (file) => {
    if (file.isDirectory()) {
      // If there's a subfolder, re-run it inside it
      await loadCommands(bot, path.join(directory.toString(), file.name));
      return;
    }

    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !moduleFiletypeRegex.test(file.name)) return;
    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> = await import(`file://${directory}/${file.name}`);
      commandToLoad = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      logger.warn(`Command ${file.name} failed to load, see stack trace below:`);
      throw new Error(`${error}`);
    }

    // Gets the filename, category, and path
    if (!commandToLoad) return;
    const splitPath = directory.toString().split("/");
    const fileName = file.name.split(moduleFiletypeRegex)[0];
    const category = splitPath[splitPath.length - 1];

    // Loads the command
    const command = new commandToLoad(bot, fileName, category);
    bot.commands.set(fileName, command);
  });
}

/**
 * Loads all events and loggers
 * @param bot Main bot object
 * @param directory The path to search for events or loggers in
 * @param isLogger Whether or not the item is a logger or not
 */

export async function loadEvents(bot: HibikiClient, directory: PathLike, isLogger = false) {
  // Loads each event file
  const files = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or subdirectories
    if (file.isDirectory() || file.name.endsWith(".map")) return;

    let eventToLoad: CallableHibikiEvent;
    if (!moduleFiletypeRegex.test(file.name)) return;

    try {
      const importedEvent: Record<string, CallableHibikiEvent> = await import(`file://${directory}/${file.name}`);
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      logger.error(`${isLogger ? "Logger" : "Event"} ${file.name} failed to load, see stack trace below:`);
      throw new Error(`${error}`);
    }

    if (!eventToLoad) return;

    // Creates the event
    const fileName = file.name.split(moduleFiletypeRegex)[0];
    const event = new eventToLoad(bot, fileName) as HibikiEvent | HibikiLogger;

    // Checks for missing intents
    if (event.requiredIntents?.length) {
      const missingIntents = checkIntents(bot.options, event.requiredIntents);
      if (missingIntents?.length) {
        logger.warn(`${isLogger ? "Logger" : "Event"} ${fileName} not loaded: missing intent(s) ${missingIntents.join(", ")}`);
        return;
      }
    }

    // Pushes the events and runs them
    (isLogger ? bot.loggers : bot.events).set(fileName, event);
  }

  // Subscribes to all of the events
  subscribeToEvents(bot, isLogger ? bot.loggers : bot.events);
}

/**
 * Subscribes to event listeners and runs them
 * @param bot Main bot object
 * @param events The events to subscribe to
 */

function subscribeToEvents(bot: HibikiClient, events: Collection<string, HibikiEvent | HibikiLogger>) {
  events.forEach((eventToListenOn) => {
    eventToListenOn.events.forEach((individualEvent) => {
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run(individualEvent, ...eventParameters));
    });
  });
}

/**
 * Registers commands via the Discord API
 * @param bot Main bot object
 * @param guild An optional guild ID to push commands to, used for dev mode
 */

export function registerSlashCommands(bot: HibikiClient, guild?: DiscordSnowflake) {
  // This shouldn't happen - but I guess it *can* happen per v10 caching
  if (!bot.user?.id) throw new Error("Failed to register slash commands: Client user field exists on the logged in account.");

  // Converts the command to Discord API-compatible JSON and removes messageOnly ones
  const jsonData = bot.commands
    .filter((command) => !command.messageOnly && !command.ownerOnly)
    .map((cmd) => {
      return cmd.toJSON();
    })
    .filter((cmd) => {
      let valid = true;
      if (!slashCommandNameRegex.test(cmd.name)) {
        logger.warn(`Command ${cmd.name} failed to register: invalid name`);
        valid = false;
      }

      cmd.options?.forEach((option) => {
        if (!slashCommandNameRegex.test(option.name)) {
          logger.warn(`Command ${cmd.name} failed to register: invalid option name: ${option.name}`);
          valid = false;
        }
      });

      return valid;
    });

  // Creates a new REST instance
  const rest = new REST({ version: "10" }).setToken(bot.config.token);
  if (!rest) throw new Error("Failed to create a Discord REST instance");

  try {
    // If a guild ID was provided, load per-guild. Else, we should load globally
    return guild?.length
      ? rest.put(Routes.applicationGuildCommands(bot.user.id, guild), { body: jsonData })
      : rest.put(Routes.applicationCommands(bot.user.id), { body: jsonData });
  } catch (error) {
    logger.error(`Error while registering slash commands: ${error}`);
    throw new Error(`${error}`);
  }
}
