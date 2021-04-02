/**
 * @file Automod
 * @description Handles running each automod event
 */

import type { Guild, Member, Message, TextChannel } from "eris";
import { PrivateChannel } from "eris";
import { Event } from "../classes/Event";
import { automodAntiInvite } from "./automod/antiInvite";
import { automodAntiNewLine } from "./automod/antiNewLines";
import { automodAntiRaid } from "./automod/antiRaid";
import { automodAntiSpam } from "./automod/antiSpam";
import { automodAntiMassMention } from "./automod/antiMassMention";

export class AutomodEvent extends Event {
  events = ["messageCreate", "guildMemberAdd"];

  async run(event: string, msg: Message<TextChannel>, member: Member) {
    switch (event) {
      /**
       * Automod events that run on messageCreate
       */

      case "messageCreate": {
        if (!msg || !msg.channel || msg?.channel instanceof PrivateChannel || msg?.author?.bot) return;

        // Tries to find the member
        let member = msg.member;
        if (!member?.roles) {
          member = await msg.channel.guild.fetchMembers({ userIDs: [msg.author.id] })[0];
        }

        // Gets the guild's config
        const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
        if (!guildconfig) return;

        if (
          // Ignores privelaged users from automod
          (member?.roles && member.roles?.includes?.(guildconfig?.staffRole)) ||
          member?.permissions?.has("administrator") ||
          member?.permissions?.has("manageGuild") ||
          member?.permissions?.has("manageMessages")
        )
          return;

        // Runs each automod event if it's configured to do so
        if (guildconfig.antiSpam && guildconfig.spamPunishments) await automodAntiSpam(msg, this.bot, guildconfig);
        if (guildconfig.antiInvite && guildconfig.invitePunishments) await automodAntiInvite(msg, this.bot, guildconfig);
        if (guildconfig.antiNewLines && guildconfig.antiNewLinesPunishments) await automodAntiNewLine(msg, this.bot, guildconfig);
        if (guildconfig.antiMassMention && guildconfig.antiMassMentionPunishments) await automodAntiMassMention(msg, this.bot, guildconfig);

        break;
      }

      /**
       * Antiraid functionality
       */

      case "guildMemberAdd": {
        const guild = (msg as unknown) as Guild;
        const guildconfig = await this.bot.db.getGuildConfig(guild.id);
        if (!guildconfig) return;
        if (guildconfig?.antiRaid) automodAntiRaid(guild, member, this.bot, guildconfig);

        break;
      }
    }
  }
}
