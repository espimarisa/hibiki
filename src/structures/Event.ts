/**
 * @file Event
 * @description Base class for events
 * @author Espi <contact@espi.me>
 */

import { hibikiClient } from "./Client";

/**
 * Main event class
 * @abstract
 */

export abstract class Event {
  abstract events: string[];

  abstract run(bot: hibikiClient, ...args: unknown[]): void;
}
