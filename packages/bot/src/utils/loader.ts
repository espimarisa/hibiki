import type { HibikiClient } from "$classes/Client.ts";
import type { CallableHibikiCommand, HibikiCommandJSON } from "$classes/Command.ts";
import type { CallableHibikiEvent, HibikiEvent } from "$classes/Event.ts";
import { MODULE_FILE_TYPE_REGEX } from "$shared/constants.ts";
import env from "$shared/env.js";
import logger from "$shared/logger.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "node:fs/promises";

// Loads all commands
export async function loadCommands(bot: HibikiClient, directory: string) {
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) continue;
    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> = await import(`file://${directory.toString()}/${file.name}`);
      commandToLoad = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Command ${file.name} failed to load: ${Bun.inspect(error)}`);
      return;
    }

    // Creates the command
    const name = file.name.split(MODULE_FILE_TYPE_REGEX)[0].toLowerCase();
    const command = new commandToLoad(bot, name);
    bot.commands.set(name, command);
  }
}

// Loads all events
export async function loadEvents(bot: HibikiClient, directory: string) {
  // Loads each event file
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or subdirectories
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) continue;
    let eventToLoad: CallableHibikiEvent;

    try {
      const importedEvent: Record<string, CallableHibikiEvent> = await import(`file://${directory.toString()}/${file.name}`);
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Event ${file.name} failed to load: ${Bun.inspect(error)}`);
      return;
    }

    const name = file.name.split(MODULE_FILE_TYPE_REGEX)[0];
    const event = new eventToLoad(bot, name);

    // Pushes the events and runs them
    bot.events.set(name, event);
  }

  // Subscribes to all of the events
  subscribeToEvents(bot, bot.events as Map<string, HibikiEvent>);
}

// Registers all interactions to the Discord gateway
export async function registerInteractions(bot: HibikiClient, guild?: string) {
  if (!bot.user?.id) throw new Error("No user object is ready, have you logged into a valid token yet?");
  const jsonData: HibikiCommandJSON[] = [];

  for (const command of bot.commands.values()) {
    // Pushes each command JSON to the list of commands
    jsonData.push(command.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(env.BOT_TOKEN);

  // Registers commands to a specific guild
  guild
    ? await rest.put(Routes.applicationGuildCommands(bot.user.id as string, guild), { body: jsonData })
    : await rest.put(Routes.applicationCommands(bot.user.id as string), { body: jsonData });
}

// Subscribes to event listeners and fires an event when needed
function subscribeToEvents(bot: HibikiClient, events: Map<string, HibikiEvent>) {
  for (const eventToListenOn of events.values()) {
    for (const individualEvent of eventToListenOn.events) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run([individualEvent], ...eventParameters));
    }
  }
}
