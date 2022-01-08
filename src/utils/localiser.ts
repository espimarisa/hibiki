/**
 * @file Localiser
 * @description Utilities to localise and format internal strings
 * @module localiser
 */

import type { getString } from "../typings/locales";
import type { Status } from "discord.js";

/**
 * Localises and formats shard status codes
 * @param fn The function to fetch a string with
 * @param status THe shard status code to localise
 */

export function localiseShardStatus(fn: getString, status: Status) {
  switch (status) {
    // "READY"
    case 0:
      return fn("global.SHARD_STATUS_READY");
    // "CONNECTING"
    case 1:
      return fn("global.SHARD_STATUS_CONNECTING");
    // "RECONNECTING"
    case 2:
      return fn("global.SHARD_STATUS_RECONNECTING");
    // "IDLE"
    case 3:
      return fn("global.SHARD_STATUS_IDLE");
    // "NEARLY"
    case 4:
      return fn("global.SHARD_STATUS_NEARLY");
    // "DISCONNECTED"
    case 5:
      return fn("global.SHARD_STATUS_DISCONNECTED");
    // "WAITING_FOR_GUILDS"
    case 6:
      return fn("global.SHARD_STATUS_WAITING");
    // "IDENTIFYING"
    case 7:
      return fn("global.SHARD_STATUS_IDENTIFYING");
    // "RESUMING"
    case 8:
      return fn("global.SHARD_STATUS_RESUMING");
    case undefined:
    default:
      return `${status}`;
  }
}
