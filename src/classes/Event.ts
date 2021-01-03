/**
 * @file Event
 * @description Base class for events
 */

import type { HibikiClient } from "./Client";
import { tagUser } from "../helpers/format";

export abstract class Event {
  tagUser: typeof tagUser;
  abstract events: string[];

  constructor(protected bot: HibikiClient, public name: string) {
    this.tagUser = tagUser;
  }

  abstract run(event: string, ...params: unknown[]): Promise<unknown> | void;
}
