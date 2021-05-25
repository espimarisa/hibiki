/**
 * @file Event
 * @description Base class for events
 */

import type { HibikiClient } from "./Client";

import { convertHex } from "../utils/embed";
import { tagUser } from "../utils/format";

export abstract class Event {
  readonly convertHex: typeof convertHex = convertHex;
  readonly tagUser: typeof tagUser = tagUser;
  abstract events: string[];

  constructor(protected bot: HibikiClient, public name: string) {}

  abstract run(event: string, ...params: unknown[]): Promise<unknown> | void;
}
