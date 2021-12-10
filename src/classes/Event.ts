/**
 * @file Event
 * @description Base class for all Hibiki events to extend from
 * @module HibikiEvent
 */

import type { HibikiClient } from "./Client";

export abstract class HibikiEvent {
  abstract events: HibikiEventEmitter[];

  /**
   * Creates a new Hibiki event
   * @param bot Main bot object
   * @param name The event name, matching the filename
   */

  constructor(protected bot: HibikiClient, public name: string) {}

  /**
   * Runs an event
   * @param event The event to run
   * @param params Event params
   */

  public abstract run(event: HibikiEventEmitter, ...parameters: any[]): Promise<void>;
}
