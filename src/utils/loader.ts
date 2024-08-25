import fs from "node:fs/promises";
import type { HibikiClient } from "$classes/Client.ts";
import type { HibikiCommand, RESTCommandOptions } from "$classes/Command.ts";
import type { HibikiEvent } from "$classes/Event.ts";
import type commands from "$locales/en-US/commands.json";
import { MODULE_FILE_TYPE_REGEX } from "$utils/constants.ts";
import { env } from "$utils/env.ts";
import { getLocalizationsForKey } from "$utils/i18n.ts";
import { logger } from "$utils/logger.ts";
import { REST } from "@discordjs/rest";
import { type APIApplicationCommandOption, ApplicationCommandOptionType, Routes } from "discord-api-types/v10";

const optionRegex = /COMMAND_(\w+)_OPTION_(\d+)_(\w+)/;
const subCommandOptionNameRegex = /COMMAND_(\w+)_SUBCOMMAND_(\d+)_OPTION_(\d+)_NAME/;
const subCommandOptionDescRegex = /COMMAND_(\w+)_SUBCOMMAND_(\d+)_OPTION_(\d+)_DESCRIPTION/;

// Loads all commands
export async function loadCommands(bot: HibikiClient, directory: string) {
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Only attempt to load modules; don't load mapping files
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) {
      continue;
    }

    let commandToLoad: new (_bot: HibikiClient, _name: string) => HibikiCommand;

    try {
      // Imports the command
      const importedCommand: Record<string, HibikiCommand> = await import(`file://${directory}/${file.name}`);
      if (!importedCommand) {
        logger.error(`Commmand ${file.name} failed to import`);
        continue;
      }

      // @ts-expect-error We can reasonably expect that this won't be null, as it is caught by the above check
      commandToLoad = importedCommand[Object.keys(importedCommand)[0]];
    } catch (error) {
      logger.error(`Command ${file.name} failed to load: ${Bun.inspect(error)}`);
      continue;
    }

    // Gets the command name
    const name = file.name.split(MODULE_FILE_TYPE_REGEX)[0]?.toLowerCase();
    if (!name) {
      logger.error(`Command ${file.name} failed to load: Could not generate filename`);
      continue;
    }

    // Initializes the command
    const command = new commandToLoad(bot, name);

    // Don't load commands with no provided API keys
    let missingKeys = false;
    if (command.requiredAPIKeys && !command.requiredAPIKeys.every((k) => Object.keys(env).includes(k))) {
      logger.warn(`Command ${command.name} not loaded: API key(s) ${command.requiredAPIKeys.join(", ")} not provided`);
      missingKeys = true;
    }

    // Loads all commands
    if (!missingKeys) {
      bot.commands.set(name, command);
    }
  }
}

// Loads all events
export async function loadEvents(bot: HibikiClient, directory: string) {
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Only attempt to load modules; don't load source mappings
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) {
      continue;
    }

    let eventToLoad: new (_bot: HibikiClient, _name: string) => HibikiEvent;

    try {
      // Imports the event
      const importedEvent: Record<string, HibikiEvent> = await import(`file://${directory}/${file.name}`);
      if (!importedEvent) {
        logger.error(`Event ${file.name} failed to import`);
        continue;
      }

      // @ts-expect-error We can reasonably expect that this won't be null, as it is caught by the above check
      eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
    } catch (error) {
      // Catches and logs the error but allows the bot to still run
      logger.error(`Event ${file.name} failed to load: ${Bun.inspect(error)}`);
      continue;
    }

    // Gets the event name
    const name = file.name.split(MODULE_FILE_TYPE_REGEX)[0];
    if (!name) {
      logger.error(`Event ${file.name} failed to load: Could not generate filename`);
      continue;
    }

    // Initializes the event
    const event = new eventToLoad(bot, name);
    bot.events.set(name, event);
  }

  // Subscribes to event listerners
  subscribeToEvents(bot, bot.events);
}

// Registers interactions to the Discord gateway
export async function registerInteractions(bot: HibikiClient, data: RESTCommandOptions[], guild?: boolean) {
  if (!bot.user?.id) {
    throw new Error("No user object is ready, have you logged into a valid token yet?");
  }

  // Creates a REST manager
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

  try {
    if (guild) {
      // Registers commands to a specific guild
      await rest.put(Routes.applicationGuildCommands(bot.user.id, env.DISCORD_TEST_GUILD_ID), { body: data });
    } else {
      // Registers global slash commands
      await rest.put(Routes.applicationCommands(bot.user.id), { body: data });
    }
  } catch (error: unknown) {
    throw new Error(Bun.inspect(error));
  }
}

// Subscribes to all event listeners and fires when called on
function subscribeToEvents(bot: HibikiClient, events: Map<string, HibikiEvent>) {
  for (const eventToListenOn of events.values()) {
    for (const individualEvent of eventToListenOn.events) {
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run([individualEvent], ...eventParameters));
    }
  }
}

// Generates REST-compatible interaction data
export async function generateInteractionRESTData(bot: HibikiClient) {
  const RESTCommandData: RESTCommandOptions[] = [];

  for (const command of bot.commands.values()) {
    // Gets a list of all command name and description localizations
    const commandNameString = `commands:COMMAND_${command.name.toUpperCase()}_NAME` as keyof typeof commands;
    const commandDescriptionString =
      `commands:COMMAND_${command.name.toUpperCase()}_DESCRIPTION` as keyof typeof commands;
    const localizedCommandNames = await getLocalizationsForKey(commandNameString, true);
    const localizedCommandDescriptions = await getLocalizationsForKey(commandDescriptionString);

    // No error handler, as command.name will *always* default to the filename
    if (localizedCommandNames) {
      command.name = localizedCommandNames[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
      command.name_localizations = localizedCommandNames;
    }

    // Localizes the command description
    if (localizedCommandDescriptions) {
      command.description = localizedCommandDescriptions[env.DEFAULT_LOCALE]?.substring(0, 100) as string;
      command.description_localizations = localizedCommandDescriptions;
    } else {
      // Fallback description
      command.description
        ? command.description
        : "Command description not defined. Please check the default locale file.";
    }

    // Localizes options
    for (const [index, option] of (command.options as APIApplicationCommandOption[])?.entries() ?? []) {
      // Gets a list of all option name and option description localizations
      const optionNameString =
        `commands:COMMAND_${command.name.toUpperCase()}_OPTION_${index}_NAME` as keyof typeof commands;
      const optionDescString =
        `commands:COMMAND_${command.name.toUpperCase()}_OPTION_${index}_DESCRIPTION` as keyof typeof commands;

      const localizedOptionNames = await getLocalizationsForKey(optionNameString, true, optionRegex);
      const localizedOptionDescriptions = await getLocalizationsForKey(optionDescString, false, optionRegex);

      // Localizes the command option names
      if (localizedOptionNames) {
        option.name = localizedOptionNames[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
        option.name_localizations = localizedOptionNames;
      } else {
        // Fallback option name
        option.name ? option.name : `unknown${index}`;
      }

      // Localizes the command option descriptions
      if (localizedOptionDescriptions) {
        option.description = localizedOptionDescriptions[env.DEFAULT_LOCALE]?.substring(0, 100) as string;
        option.description_localizations = localizedOptionDescriptions;
      } else {
        // Fallback description
        option.description
          ? option.description
          : `Option description ${index} not defined. Please check the default locale file.`;
      }

      // Localizes subcommands
      if (option.type === ApplicationCommandOptionType.Subcommand) {
        for (const [optIndex, subOpt] of option.options?.entries() ?? []) {
          const subOptNameString =
            `commands:COMMAND_${command.name.toUpperCase()}_SUBCOMMAND_${index}_OPTION_${optIndex}_NAME` as keyof typeof commands;

          const subOptDescString =
            `commands:COMMAND_${command.name.toUpperCase()}_SUBCOMMAND_${index}_OPTION_${optIndex}_DESCRIPTION` as keyof typeof commands;

          // Generates localizations for subcommand option names
          const localizedOptNames = await getLocalizationsForKey(subOptNameString, true, subCommandOptionNameRegex);

          // Generates localization for subcommand option descriptions
          const localizedOptDescs = await getLocalizationsForKey(subOptDescString, false, subCommandOptionDescRegex);

          // Localizes the subcommand option names
          if (localizedOptNames) {
            subOpt.name = localizedOptNames[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
            subOpt.name_localizations = localizedOptNames;
          } else {
            // Fallback subcommand option name
            subOpt.name = subOpt.name ? subOpt.name : `unknown${optIndex}`;
          }

          // Localizes the subcommand option descriptions
          if (localizedOptDescs) {
            subOpt.description = localizedOptDescs[env.DEFAULT_LOCALE]?.substring(0, 32) as string;
            subOpt.description_localizations = localizedOptDescs;
          } else {
            // Fallback subcommand option description
            subOpt.description
              ? subOpt.description
              : `Subcommand description not defined. Please check the default locale file for subcommand ${optIndex}`;
          }
        }
      }
    }

    // Pushes the REST-compatible data to the array to return
    RESTCommandData.push({
      name: command.name,
      description: command.description,
      name_localizations: command.name_localizations ?? {},
      description_localizations: command.description_localizations ?? {},
      options: command.options as APIApplicationCommandOption[],
      type: command.interactionType,
      // TODO: Troubleshoot image embeds/thumbnails in DMs
      integration_types: command.userInstallable ? [0, 1] : [0],
      contexts: command.userInstallable ? [0, 1, 2] : [0],
      nsfw: command.nsfw,
    });
  }

  return RESTCommandData;
}
