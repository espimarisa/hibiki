/**
 * @file loader
 * @description Loads and initializes commands and events
 * @author Espi Marisa <contact@espi.me>
 */

import type { PathLike } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { HibikiClient } from "$classes/HibikiClient.ts";
import type { HibikiCommand } from "$classes/HibikiCommand.ts";
import { REGEX_MODULE_FILETYPE } from "$utils/constants.ts";
import { logger } from "$utils/logger.ts";
import type { HibikiEvent } from "../classes/HibikiEvent.ts";

/**
 * Loads all files in a directory
 * @param bot The bot client to attach commands to
 * @param directory The directory to crawl
 * @param type The type of module to load
 */

export async function loadModules(
	bot: HibikiClient,
	directory: PathLike,
	type: "commands" | "events",
) {
	// Reads files in the provided directory
	const files = await fs.readdir(directory, { withFileTypes: true });

	// Iterate over each file
	for (const file of files) {
		if (file.isDirectory()) {
			await loadModules(bot, path.join(directory.toString(), file.name), type);
			return;
		}

		switch (type) {
			/**
			 * Loads commands
			 */

			case "commands": {
				// Shadow command for loading later
				let cmdToLoad: new (_bot: HibikiClient, _name: string) => HibikiCommand;

				try {
					// Attempts to import the command
					const importedCmd = await import(`file://${directory}/${file.name}`);
					if (!importedCmd) {
						logger.error(`Error while importing command ${file.name}`);
						return;
					}

					// Sets the imported command object to the command object data
					// @ts-expect-error We can reasonably expect that this won't be null, as it is caught by the above check
					cmdToLoad = importedCmd[Object.keys(importedCmd)[0]];
				} catch (error) {
					logger.error(`Error while loading command ${file.name}:`);
					throw new Error(Bun.inspect(error));
				}

				// Parses the command name
				const cmdName = file.name
					.split(REGEX_MODULE_FILETYPE)[0]
					?.toLowerCase();
				if (!cmdName) {
					logger.error(`Error while generating command ${file.name}'s name`);
					return;
				}

				// Initializes the command
				const command = new cmdToLoad(bot, cmdName);
				bot.commands.set(cmdName, command);
				break;
			}

			/**
			 * Loads events
			 */

			case "events": {
				// Shadow event for loading later
				let eventToLoad: new (_bot: HibikiClient, _name: string) => HibikiEvent;

				try {
					// Attempts to import the event
					const importedEvent: Record<string, HibikiEvent> = await import(
						`file://${directory}/${file.name}`
					);

					if (!importedEvent) {
						logger.error(`Event ${file.name} failed to import`);
						return;
					}

					// @ts-expect-error We can reasonably expect that this won't be null, as it is caught by the above check
					eventToLoad = importedEvent[Object.keys(importedEvent)[0]];
				} catch (error) {
					logger.error(`Error while loading event ${file.name}:`);
					throw new Error(Bun.inspect(error));
				}

				// Parses the event name
				const eventName = file.name.split(REGEX_MODULE_FILETYPE)[0];
				if (!eventName) {
					logger.error(`Error while generating ${file.name}'s filename`);
					return;
				}

				// Initializes the event
				const event = new eventToLoad(bot, eventName);
				bot.events.set(eventName, event);
				break;
			}

			default:
				return;
		}
	}
}

/**
 * Assigns event listeners to a bot client
 * @param bot The bot client to listen to events on
 * @param events An array of events to listen for
 */

export function subscribeToEvents(
	bot: HibikiClient,
	events: Map<string, HibikiEvent>,
) {
	for (const eventToListenOn of events.values()) {
		for (const individualEvent of eventToListenOn.events) {
			// Runs any set events listening on the fired event
			bot.on(individualEvent, (...eventParameters) =>
				eventToListenOn.run([individualEvent], ...eventParameters),
			);
		}
	}
}
