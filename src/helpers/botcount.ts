/**
 * @file Bot count
 * @description Compares and returns proper bot vs member count metrics
 * @module helper/botcount
 */

import type { Guild } from "eris";

export function botCount(this: Guild) {
  let bots = 0;

  this.members.forEach((member) => {
    if (member.bot) bots++;
  });

  return bots;
}
