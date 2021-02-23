/**
 * @file Mute handler
 * @description Checks every second to see if a mute should expire
 * @module scripts/timedMutes
 */

import type { HibikiClient } from "../classes/Client";

export class MuteHandler {
  bot: HibikiClient;
  muteCache: MuteCache[] = [];

  constructor(bot: HibikiClient) {
    this.bot = bot;
    this.muteCache = [];

    setTimeout(() => {
      this.bot.db.getMuteCache().then((muteCache) => (this.muteCache = muteCache));

      setInterval(async () => {
        this.muteCache.forEach(async (mute: MuteCache, i: number) => {
          // If nothing is cached
          if (!this.muteCache.length) return;

          if (Date.now() >= new Date(mute.expiration).getTime()) {
            // Finds the guild
            const guild = this.bot.guilds.get(mute.guild);
            if (!guild || !guild?.members?.size || !guild?.members?.has(mute.member)) return;
            const guildconfig = await this.bot.db.getGuildConfig(mute.guild);

            // Finds the guild member
            const member = guild?.members?.get?.(mute.member);
            if (!member) return;

            // Tries to add their previous roles back
            mute.roles.forEach(async (role) => {
              await member.addRole(role, "Automatically unmuted").catch(() => {});
            });

            // Updates the mute cache
            bot.db.deleteUserGuildMuteCache(guild.id, mute.member);
            this.muteCache.splice(i);

            // Unmutes the member
            if (guildconfig?.mutedRole) {
              await member.removeRole(guildconfig.mutedRole, `Automatically unmuted`).catch(() => {});
            }
          }
        });
      }, 1000);
    }, 10000);
  }
}
