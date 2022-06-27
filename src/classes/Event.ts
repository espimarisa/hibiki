/**
 * @file Event
 * @description Base class for all Hibiki events to extend from
 * @module HibikiEvent
 */

import type { HibikiClient } from "./Client.js";

// A callable type for an abstract Hibiki event, including the constructor
export interface CallableHibikiEvent {
  new (bot: HibikiClient, name: string): HibikiEvent;
}

export abstract class HibikiEvent {
  // An array of required intents for an event to listen on
  requiredIntents?: ResolvableIntentString[];

  // An array of event emitters to listen on
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
   * @param params Additional event params
   */

  public abstract run(event: HibikiEventEmitter, ...params: any[]): Promise<void>;
}
