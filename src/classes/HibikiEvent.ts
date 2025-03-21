/**
 * @file HibikiEvent
 * @description Class used to create and run Hibiki events
 * @author Espi Marisa <contact@espi.me>
 */

import type { HibikiClient } from "$classes/HibikiClient.ts";
export type HibikiEventListener = keyof import("discord.js").ClientEvents;

export abstract class HibikiEvent {
	abstract events: HibikiEventListener[];

	/**
	 * Creates a new Hibiki event listener
	 * @param bot The bot client to attach to the event
	 * @param name The event name (filename)
	 */

	protected constructor(
		public bot: HibikiClient,
		public name: string,
	) {}

	/**
	 * Runs an event
	 * @param event The event to fire on
	 * @param params Additional options
	 */

	abstract run(
		event: HibikiEventListener[],
		...params: unknown[]
	): Promise<void>;
}
