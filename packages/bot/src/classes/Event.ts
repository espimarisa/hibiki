import type { HibikiClient } from "./Client.js";

// A callable type for an abstract Hibiki event, including the constructor
export type CallableHibikiEvent = new (bot: HibikiClient, name: string) => HibikiEvent;

export abstract class HibikiEvent {
  // An array of event emitters to listen on
  abstract events: HibikiEventListener[];

  // Creates a new Hibiki event
  constructor(
    protected bot: HibikiClient,
    public name: string,
  ) {}

  // Runs an event
  public abstract run(event: HibikiEventListener[], ...params: any[]): Promise<void>;
}
