/**
 * @file Utilities for creating and registering a client event listener.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/event
 */

import { bot } from "@/root/bot.js";
import { type ClientEvents, Collection } from "discord.js";

/** Typing for an event handler. */
export type HibikiEvent = {
	/** The client event to listen on. */
	event: keyof ClientEvents;

	/** Only runs the event once. Defaults to false. */
	once: boolean;

	/**
	 * Function to run upon an event firing.
	 */

	runEvent: (...params: never[]) => Promise<void>;
};

/** A Discord.js collection containing imported event handlers. */
export const events = new Collection<string, HibikiEvent>();

/**
 * Creates a client event handler.
 * @param event The event handler to register.
 */

export function createEvent(event: HibikiEvent) {
	events.set(event.event, event);
}

/**
 * Registers event handlers.
 * @param eventHandlers The collection of events register.
 */

export function registerEvents(eventListeners: typeof events) {
	for (const individualEvent of eventListeners.values()) {
		// Runs events that fire once
		if (individualEvent.once) {
			bot.once(individualEvent.event, async (...args) => {
				await individualEvent.runEvent(...(args as never[]));
			});
		} else {
			// Runs events that fire multiple times
			bot.on(individualEvent.event, async (...args) => {
				await individualEvent.runEvent(...(args as never[]));
			});
		}
	}
}
