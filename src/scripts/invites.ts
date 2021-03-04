/**
 * @file Invite cacher
 * @description Caches invites for the invite logger
 * @module scripts/invites
 */

import type { Invite } from "eris";
import type { HibikiClient } from "../classes/Client";

export class InviteHandler {
  bot: HibikiClient;
  inviteCache: Record<string, Invite[]>;
  constructor(bot: HibikiClient) {
    this.bot = bot;
    this.inviteCache = {};

    if (this.bot.config.inviteLogs === false) return;

    setTimeout(async () => {
      let i = 0;
      this.bot.guilds.forEach(async (guild) => {
        i++;
        setTimeout(async () => {
          // Don't cache guilds that opted out
          const guildconfig = await this.bot.db.getGuildConfig(guild.id);
          if (guildconfig?.inviteOptOut === true) return;

          const invites = await guild.getInvites().catch(() => {});
          if (!invites) return;

          this.inviteCache[guild.id] = invites;
        }, i * 5000);
      });
    }, 35000);
  }
}
