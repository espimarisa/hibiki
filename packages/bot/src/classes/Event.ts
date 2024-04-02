import type { HibikiClient } from "$classes/Client.ts";
import type { HibikiEventListener } from "$typings/index.d.ts";

export abstract class HibikiEvent {
  // An array of event emitters to listen on
  abstract events: HibikiEventListener[];

  // Creates a new Hibiki event
  protected constructor(
    public bot: HibikiClient,
    public name: string,
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Abstract constructor
  ) {}

  // Runs an event
  abstract run(event: HibikiEventListener[], ...params: unknown[]): Promise<void>;
}

// A callable type for an abstract Hibiki event, including the constructor
export type CallableHibikiEvent = new (_bot: HibikiClient, _name: string) => HibikiEvent;
