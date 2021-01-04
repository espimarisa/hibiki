/**
 * @file Automod
 * @description Base automod class; handles running each automod event
 */

import type { Message, TextChannel } from "eris";
import { PrivateChannel } from "eris";
import { Event } from "../classes/Event";
import { automodAntiInvite } from "./automod/antiInvite";
import { automodAntiSpam } from "./automod/antiSpam";

export class Automod extends Event {
  events = ["messageCreate"];

  async run(_event: string, msg: Message<TextChannel>) {
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
      (member?.roles && guildconfig?.staffRole && member.roles?.includes(guildconfig?.staffRole)) ||
      member.permissions.has("administrator") ||
      member.permissions.has("manageGuild") ||
      member.permissions.has("manageMessages")
    )
      return;

    // Runs each automod event if it's configured to do so
    if (guildconfig?.antiSpam && guildconfig?.spamPunishments) await automodAntiSpam(msg, this.bot, guildconfig);
    if (guildconfig?.antiInvite && guildconfig?.invitePunishments) await automodAntiInvite(msg, this.bot, guildconfig);
  }
}
