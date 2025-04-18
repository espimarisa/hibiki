// TODO: Register user commands

/**
 * @file Registers command interactions to the Discord API.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@/utils/env.js";
import { parseError } from "@/utils/error.js";
import {
  getDirname,
  hibikiCommandInteractions,
  loadCommandInteractions,
} from "@/utils/fs.js";
import { initI18Next } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { join } from "node:path";
import { exit } from "node:process";
import { parseArgs } from "node:util";
import {
  REST,
  type RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  type User,
} from "discord.js";

// Gets the root, command interactions, and locales directory
const ROOT_DIRECTORY = getDirname(import.meta.url);
const COMMAND_INTERACTIONS_DIRECTORY = join(
  ROOT_DIRECTORY,
  "./interactions/commands",
);
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");

// Determines if we should register to a development guild
const isDevelop = env.NODE_ENV === "development" && env.DISCORD_DEV_GUILD_ID;
const data: RESTPostAPIApplicationCommandsJSONBody[] = [];

// Parses CLI arguments
const cliArgs = parseArgs({
  allowPositionals: true,
  args: Bun.argv,
  options: {
    clear: {
      type: "boolean",
    },
    guild: {
      type: "string",
    },
  },
  strict: true,
});

// Checks if clear is set and if we should perform guild operations
const clear = cliArgs?.values?.clear === true;
const guild =
  cliArgs?.values?.guild || (isDevelop ? env.DISCORD_DEV_GUILD_ID : undefined);

// Loads i18next and command interactions
await initI18Next(LOCALES_DIRECTORY);
await loadCommandInteractions(
  COMMAND_INTERACTIONS_DIRECTORY,
  hibikiCommandInteractions,
);

// Creates a REST manager; gets the user object
const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const user = (await rest.get("/oauth2/applications/@me")) as User | undefined;

// Do not perform operations if no user object is returned
if (!user?.id) {
  logger.error("No user returned from Discord, cannot register. Exiting.");
  exit(1);
}

// Maps the collection of commands
hibikiCommandInteractions.map((command) => {
  // Convert command.data to JSON
  if (command.data) {
    data.push(command.data.toJSON());
  } else {
    logger.error(`Command data is undefined for command: ${command}`);
  }
});

// Exits if no data and clear isn't set
if (!(data || clear)) {
  logger.error("No data was provided. Cannot register. Exiting.");
  exit(1);
}

// Message to log to the console (clearing if clear, registering if not)
const message = clear ? "clearing all commands" : "registering commands";
logger.info(`Registering as user ${user.id}`);

// Individual guild operations
if (guild) {
  try {
    // Registers/clears guild commands
    const route = Routes.applicationGuildCommands(user.id, guild);
    await rest.put(route, { body: clear ? [] : data });
    logger.info(`Finished ${message} to ${guild}. Exiting.`);
  } catch (err) {
    const error = parseError(err);
    logger.error(`Failed ${message} to ${guild}: ${error.message}`);
    exit(1);
  }
} else {
  try {
    // Registers/clears global commands
    const route = Routes.applicationCommands(user.id);
    await rest.put(route, { body: clear ? [] : data });
    logger.info(`Finished ${message} globally. Exiting.`);
  } catch (err) {
    const error = parseError(err);
    logger.error(`Failed ${message} globally: ${error.message}`);
    exit(1);
  }
}

exit();
