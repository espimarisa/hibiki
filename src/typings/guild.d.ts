/**
 * @file Guild typings
 * @description Typings and extensions for Eris.Guild
 * @typedef guild
 */

import type { botCount, memberOnlyCount } from "../helpers/botcount";

declare module "eris" {
  declare interface Guild {
    botCount: botCount;
    memberOnlyCount: memberOnlyCount;
  }
}
