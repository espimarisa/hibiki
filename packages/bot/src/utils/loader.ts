import type { HibikiClient } from "$classes/Client.ts";
import type { CallableHibikiCommand } from "$classes/Command.ts";
import type { CallableHibikiEvent, HibikiEvent } from "$classes/Event.ts";
import { MODULE_FILE_TYPE_REGEX } from "$shared/constants.ts";
import env from "$shared/env.js";
import { t, getListOfLocales } from "$shared/i18n.ts";
import logger from "$shared/logger.js";
import { REST } from "@discordjs/rest";
import { Routes, type APIApplicationCommandOption } from "discord-api-types/v10";
import { ApplicationCommandType } from "discord.js";
import fs from "node:fs/promises";

const localizedNames = new Map<string, string>();
const localizedDescriptions = new Map<string, string>();
const commandNames: string[] = [];

// Valid localization data
const commandLocalizationData: {
  command: string;
  locale: string;
  name: string;
  description: string;
}[] = [];

// Loads all commands
export async function loadCommands(bot: HibikiClient, directory: string) {
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) continue;
    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> = await import(`file://${directory}/${file.name}`);
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
    commandNames.push(name);
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
      const importedEvent: Record<string, CallableHibikiEvent> = await import(`file://${directory}/${file.name}`);
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
  subscribeToEvents(bot, bot.events);
}

// Registers all interactions to the Discord gateway
export async function registerInteractions(bot: HibikiClient, guild?: string) {
  if (!bot.user?.id) throw new Error("No user object is ready, have you logged into a valid token yet?");

  // TODO: Update this to match a real type from Discord.js
  // A JSON array of application commands
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
  const commandData: {
    name?: string;
    description?: string;
    name_localizations?: Record<string, string>;
    description_localizations?: Record<string, string>;
    options?: APIApplicationCommandOption[];
    type?: ApplicationCommandType;
  }[] = [];

  // Gets a list of locales to search for
  const locales = await getListOfLocales();

  // Generates command localizations
  generateCommandLocalizations(commandNames, locales);

  // Generates all command data for REST
  for (const command of bot.commands.values()) {
    // Finds the command to localize
    const commandToLocalize = commandLocalizationData.filter((c) => c.command === command.name);

    // Creates maps for Discord's REST
    for (const localization of commandToLocalize) {
      localizedNames.set(localization.locale, localization.name.toLowerCase());
      localizedDescriptions.set(localization.locale, localization.description);
    }

    // Gets a default localization
    const defaultLocalization = commandToLocalize.find((c) => c.command === command.name && c.locale === "en-US");
    const description = command.interactionType === ApplicationCommandType.ChatInput ? defaultLocalization?.description : undefined;

    // TODO: More properties
    commandData.push({
      name: command.name.toLowerCase(),
      description: description,
      name_localizations: Object.fromEntries(localizedNames),
      description_localizations: Object.fromEntries(localizedDescriptions),
      options: command.options,
      type: command.interactionType,
    });
  }

  const rest = new REST({ version: "10" }).setToken(env.BOT_TOKEN);

  // Registers commands to a specific guild
  // TODO: Make a delete-all-slash-commands command to clean up my mess
  guild
    ? await rest.put(Routes.applicationGuildCommands(bot.user.id, guild), { body: commandData })
    : await rest.put(Routes.applicationCommands(bot.user.id), { body: commandData });
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

// Generates localizations for all command names and descriptions
function generateCommandLocalizations(commands: string[], locales: string[]) {
  // Gets what locale string to look up
  for (const command of commands) {
    const commandName = `COMMAND_${command.toUpperCase()}_NAME`;
    const commandDescription = `COMMAND_${command.toUpperCase()}_DESCRIPTION`;

    for (const locale of locales) {
      // Gets localized name and description
      const name = t(commandName, { lng: locale });
      const description = t(commandDescription, { lng: locale });

      // Pushes command, locale, name, and description to an array containing all command data
      commandLocalizationData.push({
        command: command,
        locale: locale,
        name: name,
        description: description,
      });
    }
  }
}
