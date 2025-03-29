/**
 * @file Utilities for creating and registering a Hibiki event.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/event
 */

import { bot } from "@/root/hibiki.js";
import { Collection } from "discord.js";

// Creates a collection of events
export const HIBIKI_EVENTS = new Collection<string, HibikiEvent>();

// Typing shortcut for an individual Discord ClientEvent
export type ClientEvent = keyof import("discord.js").ClientEvents;

export interface HibikiEvent {
	event: ClientEvent;
	once: boolean;

	/**
	 * Runs a Hibiki event via a Discord interaction.
	 * @param params Additional event arguments.
	 */

	runEvent: (...params: never[]) => Promise<void> | void;
}

/**
 * Registers a Hibiki event into the collection.
 * @param event The event to add to the collection.
 */

export function createHibikiEvent(event: HibikiEvent) {
	HIBIKI_EVENTS.set(event.event, event);
}

/**
 * Subscribes to events and runs them.
 * @param events A collection of events to subscribe to.
 */

export function subscribeToEvents(events: typeof HIBIKI_EVENTS) {
	for (const individualEvent of events.values()) {
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
