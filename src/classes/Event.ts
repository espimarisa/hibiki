/**
 * @file Event
 * @description Base class for events
 */

import type { HibikiClient } from "./Client";

export abstract class Event {
  abstract events: string[];

  constructor(protected bot: HibikiClient, public name: string) {}

  abstract run(...params: unknown[]): Promise<unknown> | void;
}
