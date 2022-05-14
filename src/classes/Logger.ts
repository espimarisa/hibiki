/**
 * @file Logger
 * @description Base class for loggers to extend from
 * @module HibikiLogger
 */

import { HibikiEvent } from "./Event.js";

export abstract class HibikiLogger extends HibikiEvent {
  // TODO: Implement requiredIntents to not load loggers if we're missing an intent
}
