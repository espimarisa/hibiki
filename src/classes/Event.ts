/**
 * @file Event
 * @description Base class for events
 */

import type { HibikiClient } from "./Client";
import { convertHex } from "../utils/embed";
import { tagUser } from "../utils/format";

export abstract class Event {
  convertHex: typeof convertHex;
  tagUser: typeof tagUser;
  abstract events: string[];

  constructor(protected bot: HibikiClient, public name: string) {
    this.convertHex = convertHex;
    this.tagUser = tagUser;
  }

  abstract run(event: string, ...params: unknown[]): Promise<unknown> | void;
}
