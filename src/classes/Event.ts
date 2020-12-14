/**
 * @file Event
 * @description Base class for events
 */

import { HibikiClient } from "./Client";

/**
 * Main event class
 * @abstract
 */

export abstract class Event {
  abstract events: string[];

  abstract run(bot: HibikiClient, ...args: unknown[]): void;
}
