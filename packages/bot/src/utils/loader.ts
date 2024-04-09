import fs from "node:fs/promises";
import type { HibikiClient } from "$classes/Client.ts";
import type { CallableHibikiCommand, RESTCommandOptions } from "$classes/Command.ts";
import type { CallableHibikiEvent, HibikiEvent } from "$classes/Event.ts";
import type en from "$locales/en-US/bot.json";
import { MODULE_FILE_TYPE_REGEX } from "$shared/constants.ts";
import { env } from "$shared/env.ts";
import { getLocalizationsForKey } from "$shared/i18n.ts";
import { logger } from "$shared/logger.ts";
import { REST } from "@discordjs/rest";
import { type APIApplicationCommandOption, ApplicationCommandOptionType, Routes } from "discord-api-types/v10";

const optionRegex = /COMMAND_(\w+)_OPTION_(\d+)_(\w+)/;
const subCommandOptionNameRegex = /COMMAND_(\w+)_SUBCOMMAND_(\d+)_OPTION_(\d+)_NAME/;
const subCommandOptionDescRegex = /COMMAND_(\w+)_SUBCOMMAND_(\d+)_OPTION_(\d+)_DESCRIPTION/;

// Loads all commands
export async function loadCommands(bot: HibikiClient, directory: string) {
  const files = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });

  for (const file of files) {
    // Don't try to load source mappings or other jank stuff
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) {
      continue;
    }

    let commandToLoad: CallableHibikiCommand;

    // Tries to load the command
    try {
      const importedCommand: Record<string, CallableHibikiCommand> | undefined = await import(
        `file://${directory}/${file.name}`
      );

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

    // Generates the command constructor
    const command = new commandToLoad(bot, name);
    bot.commands.set(name, command);
  }
}

// Loads all events
export async function loadEvents(bot: HibikiClient, directory: string) {
  // Loads each event file
  const files = await fs.readdir(directory, {
    withFileTypes: true,
    encoding: "utf8",
  });

  for (const file of files) {
    // Don't try to load source mappings or subdirectories
    if (file.name.endsWith(".map") || !MODULE_FILE_TYPE_REGEX.test(file.name)) {
      continue;
    }

    let eventToLoad: CallableHibikiEvent;

    try {
      const importedEvent: Record<string, CallableHibikiEvent> | undefined = await import(
        `file://${directory}/${file.name}`
      );

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
export async function registerInteractions(bot: HibikiClient, data: RESTCommandOptions[], guild?: boolean) {
  if (!bot.user?.id) {
    throw new Error("No user object is ready, have you logged into a valid token yet?");
  }

  // Creates a REST manager
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

  // Registers commands to a specific guild
  try {
    if (guild) {
      await rest.put(Routes.applicationGuildCommands(bot.user.id, env.DISCORD_TEST_GUILD_ID), {
        body: data,
      });
    } else {
      await rest.put(Routes.applicationCommands(bot.user.id), {
        body: data,
      });
    }
  } catch (error: unknown) {
    throw new Error(Bun.inspect(error));
  }
}

// Subscribes to event listeners and fires an event when needed
function subscribeToEvents(bot: HibikiClient, events: Map<string, HibikiEvent>) {
  for (const eventToListenOn of events.values()) {
    for (const individualEvent of eventToListenOn.events) {
      bot.on(individualEvent, (...eventParameters) => eventToListenOn.run([individualEvent], ...eventParameters));
    }
  }
}

// Generates REST-compatible interaction data
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: I can be as complex as I want, bitch
export async function generateInteractionRESTData(bot: HibikiClient) {
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
  const commandData: RESTCommandOptions[] = [];

  // Generates all command data for REST
  for (const command of bot.commands.values()) {
    // Generates localizations
    const commandNameString = `COMMAND_${command.name.toUpperCase()}_NAME` as keyof typeof en;
    const commandDescriptionString = `COMMAND_${command.name.toUpperCase()}_DESCRIPTION` as keyof typeof en;

    // Gets a list of localized command names and descriptions
    const localizedCommandNames = await getLocalizationsForKey(commandNameString, true);
    const localizedCommandDescriptions = await getLocalizationsForKey(commandDescriptionString);

    // No error handler, as command.name will *always* default to the filename
    if (localizedCommandNames) {
      command.name = localizedCommandNames[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
      command.name_localizations = localizedCommandNames;
    }

    // Sets the description if found
    if (localizedCommandDescriptions) {
      command.description = localizedCommandDescriptions[env.DEFAULT_LOCALE]?.substring(0, 100) as string;
      command.description_localizations = localizedCommandDescriptions;
    } else {
      // Sets a fallback; bot shouldn't crash without but it's nice to check
      command.description = "not set! check the default locale file";
    }

    // Localizes options
    for (const [index, option] of (command.options as APIApplicationCommandOption[])?.entries() ?? []) {
      // Generates string to test to see if they exist
      const optionNameString = `COMMAND_${command.name.toUpperCase()}_OPTION_${index}_NAME` as keyof typeof en;
      const optionDescString = `COMMAND_${command.name.toUpperCase()}_OPTION_${index}_DESCRIPTION` as keyof typeof en;

      // Generates localizations
      const localizedOptionNames = await getLocalizationsForKey(optionNameString, true, optionRegex);
      const localizedOptionDescriptions = await getLocalizationsForKey(optionDescString, false, optionRegex);

      // Pushes name data
      if (localizedOptionNames) {
        // Sets name data and parses/formats it to be API compatible
        option.name = localizedOptionNames[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
        option.name_localizations = localizedOptionNames;
      } else {
        // Ugly, but the API will reject if we forget to put this in
        option.name = "unknown";
      }

      // Pushes description data
      if (localizedOptionDescriptions) {
        // Sets description data and parses/formats it to be API compatible
        option.description = localizedOptionDescriptions[env.DEFAULT_LOCALE]?.substring(0, 100) as string;
        option.description_localizations = localizedOptionDescriptions;
      } else {
        // Ugly, but the API will reject if we forget to put this in
        option.description = `not set! check the default locale file for option ${index}`;
      }

      // Subcommand group localization support
      if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
        for (const [optIndex, subOpt] of option.options?.entries() ?? []) {
          const subOptNameString = `COMMAND_${command.name.toUpperCase()}_SUBCOMMAND_${index}_OPTION_${optIndex}_NAME`;
          const subOptDescString = `COMMAND_${command.name.toUpperCase()}_SUBCOMMAND_${index}_OPTION_${optIndex}_DESCRIPTION`;

          // Generates localizations for subcommand option name
          const localizedOptNames = await getLocalizationsForKey(
            subOptNameString as keyof typeof en,
            true,
            subCommandOptionNameRegex,
          );

          // Generates localization for subcommand option desc
          const localizedOptDescs = await getLocalizationsForKey(
            subOptDescString as keyof typeof en,
            false,
            subCommandOptionDescRegex,
          );

          // Sets localized subcommand names
          if (localizedOptNames) {
            subOpt.name = localizedOptNames[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
            subOpt.name_localizations = localizedOptNames;
          } else {
            // Ugly, but the API will reject if we forget to put this in
            subOpt.name = `unknown${optIndex}`;
          }

          // Sets localized subcommand descriptions
          if (localizedOptDescs) {
            subOpt.description = localizedOptDescs[env.DEFAULT_LOCALE]?.toLowerCase().substring(0, 32) as string;
            subOpt.description_localizations = localizedOptDescs;
          } else {
            // Ugly, but the API will reject if we forget to put this in
            subOpt.description = `not set! check the index file for subcommand ${optIndex}`;
          }
        }
      }
    }

    // Pushes REST data to the array
    commandData.push({
      name: command.name,
      description: command.description,
      name_localizations: command.name_localizations,
      description_localizations: command.description_localizations,
      options: command.options as APIApplicationCommandOption[],
      type: command.interactionType,
      nsfw: command.nsfw,
    });
  }

  return commandData;
}
