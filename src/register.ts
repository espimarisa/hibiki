/**
 * @file Registers commands to the Discord API.
 * @author Espi Marisa <contact@espi.me>
 * @module register
 */

import {
	commands,
	commandToREST,
	type RESTCommand,
	registerCommands,
} from "@/utils/command.js";
import { env } from "@/utils/env.js";
import { getDirname, importDir } from "@/utils/fs.js";
import { initI18N } from "@/utils/i18n.js";
import { join } from "node:path";
import { parseArgs } from "node:util";

// Gets the commands and locales directory
const ROOT_DIRECTORY = getDirname(import.meta.url);
const LOCALES_DIRECTORY = join(ROOT_DIRECTORY, "../locales");
const COMMANDS_DIRECTORY = join(ROOT_DIRECTORY, "./commands");
const isDevelop = env.NODE_ENV === "development";
const devGuild = env.DISCORD_DEV_GUILD_ID;

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

// Clear only when --clear true is passed; allows guild ID thru CLI
const clear = cliArgs?.values?.clear === true;
const cliGuild = cliArgs?.values?.guild;
const guildOnly = isDevelop || typeof cliGuild === "string";

// Load locales and commands
await initI18N(LOCALES_DIRECTORY);
await importDir(COMMANDS_DIRECTORY);

// Generates command data to use
const data: RESTCommand[] = [];
commands.map((command) => {
	data.push(commandToREST(command));
});

// Register to a specific guild
if ((isDevelop && devGuild) || cliGuild) {
	// Register to to cli guild if passed, otherwise use the dev guild
	await registerCommands(
		env.DISCORD_TOKEN,
		data,
		cliGuild ? cliGuild : devGuild,
		guildOnly,
		clear,
	);
} else {
	// Registers commands globally
	await registerCommands(env.DISCORD_TOKEN, data, undefined, false, clear);
}
