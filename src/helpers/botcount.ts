/**
 * @file Bot count
 * @description Compares and returns the amount of bots in a guild
 * @module helpers/botcount
 */

import type { Guild } from "eris";

export function botCount(this: Guild) {
  let bots = 0;

  this.members.forEach((member) => {
    if (member.bot) bots++;
  });

  return bots;
}

export function memberOnlyCount(this: Guild) {
  let mems = 0;
  this.members.forEach((member) => {
    if (member.bot) return;
    else mems++;
  });

  return mems;
}
