import type { HibikiClient } from "$classes/Client.ts";

// An individual event listener
export type HibikiEventListener = keyof import("discord.js").ClientEvents;

export abstract class HibikiEvent {
  // Event emitters to fire the event on
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
