/**
 * @file Autorole
 * @description Handles automatic role assigning
 */

import type { Guild, Member } from "eris";
import { Event } from "../classes/Event";

export class AutoroleEvent extends Event {
  events = ["guildMemberAdd"];

  async run(event: string, guild: Guild, member: Member) {
    if (!guild || !member) return;

    // Gets the guildconfig
    const guildconfig = await this.bot.db.getGuildConfig(guild?.id);
    if (!guildconfig?.autoRoles?.length) return;

    // Gets mute cache
    const mutecache = await this.bot.db.getGuildMuteCache(guild.id);
    const mutedMember = mutecache.find((m) => m.member === member.id);
    if (mutedMember && guildconfig.mutedRole) return;
    let cfgUpdated = false;

    // Adds roles
    guildconfig.autoRoles.forEach((role, i) => {
      // Deletes roles that don't exist in guildconfig
      if (!guild.roles?.has(role)) {
        cfgUpdated = true;
        return guildconfig.autoRoles.splice(i, 1);
      }

      member.addRole(role, "Role automatically given on join").catch(() => {});
    });

    // Updates guildconfig if a role got deleted
    if (cfgUpdated) this.bot.db.updateGuildConfig(guild.id, guildconfig);
  }
}
