/**
 * @file Registers commands and interactions to Discord.
 * @author Espi Marisa <contact@espi.me>
 * @module deploy
 */

import { commandToJSON, HIBIKI_COMMANDS } from "@/utils/command.js";
import { env } from "@/utils/env.js";
import { getDirname, importDirectory } from "@/utils/fs.js";
import { loaderLogger } from "@/utils/logger.js";
import {
	type APIUser,
	REST,
	type RESTPostAPIApplicationCommandsJSONBody,
	Routes,
} from "discord.js";
import path from "node:path";
import process from "node:process";

// Gets the commands directory
const ROOT_DIRECTORY = getDirname(import.meta.url);
const COMMANDS_DIRECTORY = path.join(ROOT_DIRECTORY, "./commands");
let commandJSON: RESTPostAPIApplicationCommandsJSONBody[] = [];

// Loads commands into memory
loaderLogger.info("Registering commands...");
await importDirectory(COMMANDS_DIRECTORY).then(() => {
	// Gets a JSON array of commands to register after loading
	commandJSON = HIBIKI_COMMANDS.map((command) => commandToJSON(command));
});

// Creates a REST manager and gets the bot client ID
const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const user = (await rest.get("/oauth2/applications/@me")) as
	| APIUser
	| undefined;

// Ensures we have a client ID; exit if we don't
if (!user?.id) {
	loaderLogger.fatal("No Client ID was returned by Discord. Exiting.");
	process.exit(1);
}

try {
	// Registers commands to a single guild in development mode
	if (env.DISCORD_DEV_GUILD_ID && env.NODE_ENV === "development") {
		await rest
			.put(Routes.applicationGuildCommands(user.id, env.DISCORD_DEV_GUILD_ID), {
				body: commandJSON,
			})
			.then(() => {
				// Log when finished and kill the process
				loaderLogger.info(
					`Registered commands to guild ID ${env.DISCORD_DEV_GUILD_ID}. Exiting.`,
				);
			});
	} else {
		// Register global commands otherwise
		await rest
			.put(Routes.applicationCommands(user.id), {
				body: commandJSON,
			})
			.then(() => {
				// Log when finished and kill the process
				loaderLogger.info(
					`Registered commands globally as ${user.id}. Exiting.`,
				);
			});
	}
} catch (error) {
	loaderLogger.fatal(`Error while registering commands: ${Bun.inspect(error)}`);
	process.exit(1);
}

process.exit(0);
