/**
 * @file Registers commands to the Discord API.
 * @license zlib
 */

import { IS_DEVELOPMENT } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { getDirname, loadCommands } from "@/utils/fs.js";
import { initI18Next } from "@/utils/i18n.js";
import { clientLog } from "@/utils/logger.js";
import { join } from "node:path";
import { exit } from "node:process";
import { parseArgs } from "node:util";
import type { RESTPostAPIApplicationCommandsJSONBody, User } from "discord.js";
import { Collection, REST, Routes } from "discord.js";

// Gets directories to use.
const SRC_DIRECTORY = getDirname(import.meta.url);
const COMMANDS_DIRECTORY = join(SRC_DIRECTORY, "./commands");
const LOCALES_DIRECTORY = join(SRC_DIRECTORY, "../locales");

// Creates collections to store modules in.
const hibikiCommands = new Collection<string, HibikiCommand>();
const data: RESTPostAPIApplicationCommandsJSONBody[] = [];

// Parses CLI arguments.
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

// Checks if clear is set and if we should perform guild operations.
const clear = cliArgs?.values?.clear === true;
const guild =
  cliArgs?.values?.guild || (IS_DEVELOPMENT ? env.DEV_GUILD_ID : undefined);

// Loads i18next and commands.
await initI18Next(LOCALES_DIRECTORY);
await loadCommands(COMMANDS_DIRECTORY, hibikiCommands);

// Creates a REST manager; gets the user object.
const rest = new REST({ version: "10" }).setToken(env.BOT_TOKEN);
const user = (await rest.get("/oauth2/applications/@me")) as User | undefined;

// Do not perform operations if no user object is returned.
if (!user?.id) {
  clientLog.error("No user returned from Discord, cannot register. Exiting.");
  exit(1);
}

// Maps command data to the data array.
for (const command of hibikiCommands.values()) {
  const commandData = command.setData();
  data.push(commandData);
}

// Exits if no data and clear isn't set.
if (!(data || clear)) {
  clientLog.error("No data was provided. Cannot register. Exiting.");
  exit(1);
}

// Message to log to the console (clearing if clear, registering if not).
const message = clear ? "clearing all commands" : "registering commands";
clientLog.info(`Registering as ${user.id}.`);

// Individual guild operations.
if (guild) {
  try {
    // Registers/clears guild commands.
    const route = Routes.applicationGuildCommands(user.id, guild);
    await rest.put(route, { body: clear ? [] : data });
    clientLog.info(`Finished ${message} to ${guild}.`);
  } catch (err) {
    clientLog.error(err, `Failed ${message} to ${guild}.`);
    exit(1);
  }
} else {
  try {
    // Registers/clears global commands.
    const route = Routes.applicationCommands(user.id);
    await rest.put(route, { body: clear ? [] : data });
    clientLog.info(`Finished ${message} globally.`);
  } catch (err) {
    clientLog.error(err, `Failed ${message} globally.`);
    exit(1);
  }
}

exit();
