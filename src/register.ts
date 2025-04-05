/**
 * @file Registers slash commands to the Discord API.
 * @author Espi Marisa <contact@espi.me>
 * @module register
 */

import { slashCommands } from "@/root/index.js";
import { env } from "@/utils/env.js";
import { getDirname, loadSlashCommands } from "@/utils/fs.js";
import { initI18N } from "@/utils/i18n.js";
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

// Gets the root, commands, and locales directory
const ROOT_DIRECTORY = getDirname(import.meta.url);
const SLASH_COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands/slash");
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");

// Determines if we should register to a development guild
const isDevelop = env.NODE_ENV === "development" && env.DISCORD_DEV_GUILD_ID;

const data: RESTPostAPIApplicationCommandsJSONBody[] = [];

// Parse CLI arguments for clearing
const cliArgs = parseArgs({
  allowPositionals: true,
  args: Bun.argv,
  strict: true,
  options: {
    clear: {
      type: "boolean",
    },
    guild: {
      type: "string",
    },
  },
});

// Checks if we want to clear and if we want to work on one guild
const clear = cliArgs?.values?.clear === true;
const guild =
  cliArgs?.values?.guild || (isDevelop ? env.DISCORD_DEV_GUILD_ID : undefined);

// Load locales and slash commands
await initI18N(LOCALES_DIRECTORY);
await loadSlashCommands(SLASH_COMMANDS_DIRECTORY, slashCommands);

// Makes a REST manager and gets the client user object
const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const user = (await rest.get("/oauth2/applications/@me")) as User | undefined;

if (!user) {
  throw new Error("No user returned from Discord, cannot register.");
}

slashCommands.map((command) => {
  if (command.data) {
    logger.info(`Registering ${command.data.name}...`);
    data.push(command.data.toJSON());
  } else {
    logger.error(`Command data is undefined for command: ${command}`);
  }
});

// Exit if no data is passed and clear isn't set
if (!(data || clear)) {
  logger.error("No data was provided. Exiting.");
}

// If guildID is provided, register guild commands
if (guild) {
  const route = Routes.applicationGuildCommands(user.id, guild);
  await rest.put(route, { body: clear ? [] : data });

  // Exit after handling the single guild
  logger.info(`Only ${clear ? "clearing" : "registering to"} guild ${guild}`);
} else {
  // Register global commands
  const route = Routes.applicationCommands(user.id);
  await rest.put(route, { body: clear ? [] : data });
}

exit();
