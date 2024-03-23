import fs from "node:fs/promises";

import { REST } from "@discordjs/rest";
import { ApplicationCommandType } from "discord.js";
import { Routes } from "discord-api-types/v10";

import type { HibikiClient } from "$classes/Client.ts";
import type { CallableHibikiCommand, CommandLocalization, RESTCommandOptions } from "$classes/Command.ts";
import type { CallableHibikiEvent, HibikiEvent } from "$classes/Event.ts";
import en from "$locales/en-US/bot.json";
import { MODULE_FILE_TYPE_REGEX } from "$shared/constants.ts";
import env from "$shared/env.ts";
import { getListOfLocales, t } from "$shared/i18n.ts";
import logger from "$shared/logger.ts";

// Localization stuff
const commandNames: string[] = [];
const localizedNames = new Map<string, string>();
const localizedDescriptions = new Map<string, string>();
const commandLocalizationData: CommandLocalization[] = [];

// Loads all commands
export async function loadCommands(bot: HibikiClient, directory: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) continue;
    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> | undefined = await import(`file://${directory}/${file.name}`);

      // Handler for if the import is null/undefined
      if (!importedCommand) {
        logger.error(`Commmand ${file.name} failed to import`);
        return;
      }

      // @ts-expect-error We can reasonably expect that this won't be null, as it is caught by the above check
      commandToLoad = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Command ${file.name} failed to load: ${Bun.inspect(error)}`);
      return;
    }

    // Gets the command name
    const name = file.name.split(MODULE_FILE_TYPE_REGEX)[0]?.toLowerCase();
    if (!name) {
      logger.error(`Command ${file.name} failed to load: Could not generate filename`);
      return;
    }

    // Loads the command
    const command = new commandToLoad(bot, name);
    bot.commands.set(name, command);
    commandNames.push(name);
  }
}

// Loads all events
export async function loadEvents(bot: HibikiClient, directory: string) {
  // Loads each event file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or subdirectories
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) continue;
    let eventToLoad: CallableHibikiEvent;

    try {
      const importedEvent: Record<string, CallableHibikiEvent> | undefined = await import(`file://${directory}/${file.name}`);

      // Handler for if the import is null/undefined
      if (!importedEvent) {
        logger.error(`Event ${file.name} failed to import`);
        return;
      }

      // @ts-expect-error We can reasonably expect that this won't be null, as it is caught by the above check
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Event ${file.name} failed to load: ${Bun.inspect(error)}`);
      return;
    }

    // Gets the event name
    const name = file.name.split(MODULE_FILE_TYPE_REGEX)[0];
    if (!name) {
      logger.error(`Event ${file.name} failed to load: Could not generate filename`);
      return;
    }

    // Loads the event
    const event = new eventToLoad(bot, name);
    bot.events.set(name, event);
  }

  // Subscribes to all of the events
  subscribeToEvents(bot, bot.events);
}

// Registers all interactions to the Discord gateway
export async function registerInteractions(bot: HibikiClient, guild?: string) {
  if (!bot.user?.id) throw new Error("No user object is ready, have you logged into a valid token yet?");

  // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
  const commandData: RESTCommandOptions[] = [];

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
    const defaultLocalization = commandToLocalize.find((c) => c.command === command.name && c.locale === env.DEFAULT_LOCALE);
    const description = command.interactionType === ApplicationCommandType.ChatInput ? defaultLocalization?.description : undefined;

    // Pushes REST data to the array
    commandData.push({
      name: command.name.toLowerCase(),
      description: description,
      name_localizations: Object.fromEntries(localizedNames),
      description_localizations: Object.fromEntries(localizedDescriptions),
      options: command.options,
      type: command.interactionType,
      nsfw: command.nsfw,
    });
  }

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

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
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run([individualEvent], ...eventParameters));
    }
  }
}

// Generates localizations for all command names and descriptions
function generateCommandLocalizations(commands: string[], locales: string[]) {
  // Gets what locale string to look up
  for (const command of commands) {
    const commandName = `COMMAND_${command.toUpperCase()}_NAME` as keyof typeof en;
    const commandDescription = `COMMAND_${command.toUpperCase()}_DESCRIPTION` as keyof typeof en;

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
