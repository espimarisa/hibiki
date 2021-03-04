/**
 * @file Utility typings
 * @description Typings for our utilities
 * @typedef utils
 */

import type { TextableChannel } from "eris";

// askYesNo response data
export interface ResponseData {
  msg?: Message<TextableChannel> | null;
  response?: boolean | null;
}
