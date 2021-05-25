/**
 * @file Invite update event
 * @description Updates invite cache when invites are created or deleted
 */

import type { Guild, Invite } from "eris";

import { Event } from "../classes/Event";

export class InviteUpdateEvent extends Event {
  events = ["inviteCreate", "inviteDelete"];

  async run(event: string, guild: Guild, invite: Invite) {
    if (!guild || !invite || this.bot.config.inviteLogs === false) return;
    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    if (guildconfig?.inviteOptOut === true) return;

    // If the guild has no cached invites
    if (!this.bot.inviteHandler.inviteCache[guild.id]?.length) {
      this.bot.inviteHandler.inviteCache[guild.id] = [];
    }

    /**
     * Adds new invites on creation
     */

    switch (event) {
      case "inviteCreate": {
        this.bot.inviteHandler.inviteCache[guild.id].push(invite);
        break;
      }

      /**
       * Removes old invites on deletion
       */

      case "inviteDelete": {
        const deletedInvite = this.bot.inviteHandler.inviteCache[guild.id].find((i) => i.code === invite.code);
        const index = this.bot.inviteHandler.inviteCache[guild.id].indexOf(deletedInvite);

        // Deletes the invite from the cache
        if (deletedInvite) {
          this.bot.inviteHandler.inviteCache[guild.id].splice(index, 1);
        }
      }
    }
  }
}
