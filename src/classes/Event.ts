/**
 * @file Event
 * @description Base class for events
 */

export abstract class Event {
  abstract events: string[];

  abstract run(...params: unknown[]): Promise<unknown> | void;
}
