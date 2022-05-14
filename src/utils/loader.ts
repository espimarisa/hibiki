/**
 * @file Loader
 * @description Loads and registers commands and events
 * @module loader
 */

import type { HibikiClient } from "../classes/Client.js";
import type { HibikiCommand } from "../classes/Command.js";
import type { HibikiEvent } from "../classes/Event.js";
import type { HibikiLogger } from "../classes/Logger.js";
import type { Collection } from "discord.js";
import type { PathLike } from "node:fs";
import { moduleFiletypeRegex } from "../utils/constants.js";
import { checkIntents } from "./intents.js";
import { logger } from "./logger.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "node:fs";
import path from "node:path";

/**
 * Loads all commands
 * @param bot Main bot object
 * @param directory The directory to look for commands in
 */

export function loadCommands(bot: HibikiClient, directory: PathLike) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  files.forEach((file) => {
    if (file.isDirectory()) {
      return loadCommands(bot, path.join(directory.toString(), file.name));
    }

    let command;
    if (!moduleFiletypeRegex.test(file.name)) return;

    try {
      const importedCommand = require(`${directory}/${file.name}`);
      command = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      console.error(error);
    }

    if (!command) return;
    const splitPath = directory.toString().split("/");
    const fileName = file.name.split(moduleFiletypeRegex)[0];
    const category = splitPath[splitPath.length - 1];

    const cmd = new command(bot, fileName, category) as HibikiCommand;
    bot.commands.set(fileName, cmd);
  });
}

/**
 * Loads all events and loggers
 * @param bot Main bot object
 * @param directory The path to search for events or loggers in
 * @param isLogger Whether or not the item is a logger or not
 */

export function loadEvents(bot: HibikiClient, directory: string, isLogger = false) {
  // Loads each event file
  const files = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });

  files.forEach((file) => {
    if (file.isDirectory()) return;

    let eventToLoad;
    if (!moduleFiletypeRegex.test(file.name)) return;

    try {
      const importedEvent = require(`${directory}/${file.name}`);
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      logger.error(`${isLogger ? "Logger" : "Event"} ${file.name} failed to load: ${error}`);
      console.error(error);
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
  });

  // Subscribes to all of the events
  subscribeToEvents(bot, isLogger ? bot.loggers : bot.events);
}

/**
 * Registers commands via the Discord API
 * @param bot Main bot object
 * @param guild An optional guild ID to push commands to, used for dev mode
 */

export async function registerSlashCommands(bot: HibikiClient, guild?: DiscordSnowflake) {
  // Converts the command to Discord API-compatible JSON and removes messageOnly ones
  const jsonData = bot.commands
    .filter((command) => !command.messageOnly && !command.ownerOnly)
    .map((cmd) => {
      return cmd.toJSON();
    })
    .filter((cmd) => {
      let valid = true;
      const nameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;
      if (!nameRegex.test(cmd.name)) {
        logger.warn(`Command ${cmd.name} failed to register: invalid name`);
        valid = false;
      }
      cmd.options?.forEach((option) => {
        if (!nameRegex.test(option.name)) {
          logger.warn(`Command ${cmd.name} failed to register: invalid option name: ${option.name}`);
          valid = false;
        }
      });
      return valid;
    });

  // Creates a new REST instance
  const rest = new REST({ version: "9" }).setToken(bot.config.hibiki.token);

  // If a guild ID was provided, load per-guild. Else, we should load globally
  guild?.length
    ? rest.put(Routes.applicationGuildCommands(bot.user?.id as DiscordSnowflake, guild), { body: jsonData })
    : rest.put(Routes.applicationCommands(bot.user?.id as DiscordSnowflake), { body: [] });
}

/**
 * Runs events and loggers
 * @param events The events to subscribe to
 */

function subscribeToEvents(bot: HibikiClient, events: Collection<string, HibikiEvent | HibikiLogger>) {
  events.forEach((event) => {
    event.events.forEach((individualEvent) => {
      bot.on(individualEvent, (...eventParameters) => event.run(individualEvent, ...eventParameters));
    });
  });
}

/**
 * Processes guilds and checks if they're in the blacklist
 * This is pretty unnecesary, IMO. The way prod checks is on guildAdd, and since the blacklist command makes it leave the guild,
 * There's not really a reason to add a few seconds of latency here. The only time it *would* matter is if they added it when the bot is down,
 * but hibiki neeeever goes down I promiseee
 * - espi
 * @todo look into this
 */

export function processGuilds(bot: HibikiClient) {
  bot.guilds.cache.forEach(async (guild) => {
    if (await bot.db.getBlacklistItem(guild.id, "GUILD")) {
      guild.leave();
      bot.guilds.cache.delete(guild.id);
    }
  });
}
