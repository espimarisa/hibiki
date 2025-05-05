/**
 * @file Helpers for Hibiki event handlers.
 * @license Zlib

 */

import type { ClientEvents } from "discord.js";

/**
 * A valid Hibiki event listener.
 */

export type HibikiEvent<K extends keyof ClientEvents> = {
  /** The client event to listen on and handle. */
  event: K;

  /**
   * Only runs the listener on the first event emission (client.once).
   * @default false.
   */

  once?: boolean;

  /**
   * Runs a listener.
   * @param args Client event arguments to pass to the handler.
   */

  handle: (...args: ClientEvents[K]) => Promise<void>;
};

export type HibikiListener = keyof ClientEvents;
