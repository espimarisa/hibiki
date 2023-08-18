import type { HibikiClient } from "../classes/Client.js";
import type { CallableHibikiCommand, HibikiCommandJSON } from "../classes/Command.js";
import type { CallableHibikiEvent, HibikiEvent } from "../classes/Event.js";
import type { PathLike } from "node:fs";
import { moduleFiletypeRegex } from "$shared/constants.js";
import { sanitizedEnv } from "$shared/env.js";
import { logger } from "$shared/logger.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "node:fs";
import util from "node:util";

// Loads all commands
export async function loadCommands(bot: HibikiClient, directory: PathLike) {
  const files = fs.readdirSync(directory.toString(), { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !moduleFiletypeRegex.test(file.name)) continue;
    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> = await import(`file://${directory.toString()}/${file.name}`);
      commandToLoad = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Command ${file.name} failed to load: ${util.inspect(error)}`);
      return;
    }

    // Creates the command
    const name = file.name.split(moduleFiletypeRegex)[0].toLowerCase();
    const command = new commandToLoad(bot, name);
    bot.commands.set(name, command);
  }
}

// Loads all events
export async function loadEvents(bot: HibikiClient, directory: PathLike) {
  // Loads each event file
  const files = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or subdirectories
    if (file.name.endsWith(".map") || !moduleFiletypeRegex.test(file.name)) continue;
    let eventToLoad: CallableHibikiEvent;

    try {
      const importedEvent: Record<string, CallableHibikiEvent> = await import(`file://${directory.toString()}/${file.name}`);
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Event ${file.name} failed to load: ${util.inspect(error)}`);
      return;
    }

    const name = file.name.split(moduleFiletypeRegex)[0];
    const event = new eventToLoad(bot, name);

    // Pushes the events and runs them
    bot.events.set(name, event);
  }

  // Subscribes to all of the events
  subscribeToEvents(bot, bot.events);
}

// Registers all interactions to the Discord gateway
export async function registerInteractions(bot: HibikiClient, guild?: DiscordSnowflake) {
  if (!bot.user?.id) throw new Error("No user object is ready, have you logged into a valid token yet?");
  const jsonData: HibikiCommandJSON[] = [];

  for (const command of bot.commands.values()) {
    // Pushes each command JSON to the list of commands
    jsonData.push(command.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(sanitizedEnv.BOT_TOKEN);

  // Registers commands to a specific guild
  guild
    ? await rest.put(Routes.applicationGuildCommands(bot.user.id, guild), { body: jsonData })
    : await rest.put(Routes.applicationCommands(bot.user.id), { body: jsonData });
}

// Subscribes to event listeners and fires an event when needed
function subscribeToEvents(bot: HibikiClient, events: Map<string, HibikiEvent>) {
  for (const eventToListenOn of events.values()) {
    for (const individualEvent of eventToListenOn.events) {
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run([individualEvent], ...eventParameters));
    }
  }
}