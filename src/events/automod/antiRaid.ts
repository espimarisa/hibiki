/**
 * @fileoverview Automod antiRaid module
 * @description Attempts to detect raids and punishes members doing so
 * @module automod/antiRaid
 */

import type { Guild, Member } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { punishMute } from "./punishments";
const reason = "Raid detection (Automod)";
const joinTimes = {};

export async function automodAntiRaid(guild: Guild, member: Member, bot: HibikiClient, cfg: GuildConfig) {
  // Sets the threshold and members to punish
  if (!cfg.raidThreshold) cfg.raidThreshold = 15;
  if (!joinTimes[guild.id]) joinTimes[guild.id] = [];
  joinTimes[guild.id].push({ member: member.id, time: Date.now() });
  joinTimes[guild.id] = joinTimes[guild.id].filter((join: Record<string, number>) => Date.now() - join.time < 5000);

  // Compares the amount of members that joined to the threshold
  if (joinTimes[guild.id].length >= cfg.raidThreshold) {
    switch (cfg.raidPunishments) {
      case "Ban":
        guild.banMember(member.id, 0, reason).catch(() => {});
        break;
      case "Kick":
        guild.kickMember(member.id, reason).catch(() => {});
        break;
      case "Mute":
        punishMute(member, bot, cfg, reason, guild).catch(() => {});
        break;
    }
  }
}
