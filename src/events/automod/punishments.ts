/**
 * @file Automod Punishments
 * @description Handles each type of automod punishment
 * @module automod/punishments
 */

import { Member } from "eris";
import type { Guild, Message, TextChannel } from "eris";

import { generateSnowflake } from "../../utils/snowflake";
import type { HibikiClient } from "../../classes/Client";

// Mute punishment
export const punishMute = async (
  msg: Message<TextChannel> | Member,
  bot: HibikiClient,
  cfg: GuildConfig,
  reason: string | AntiSpam[],
  g: Guild = undefined,
) => {
  const member = msg instanceof Member ? msg : msg.member;
  const guild = msg instanceof Member ? g : msg.channel.guild;
  if (member?.roles?.includes?.(cfg.mutedRole)) return;

  // Tries to remove their previous roles
  const roles: string[] = [];
  member.roles.forEach(async (role) => {
    roles.push(role);
    await guild.removeMemberRole(member.id, role, "Automod").catch(() => {});
  });

  // Updates the mute cache
  await bot.db.insertMuteCache({ roles: roles, member: member.id, guild: guild.id });

  // Adds the muted role to the user
  await member.addRole(cfg.mutedRole, "Automod").catch(() => {});
  if (reason) bot.emit("automodMemberMute", guild, member.user, undefined, reason);
};

// Purge punishment
export const punishPurge = async (msg: Message<TextChannel>, msgs: string[]) => {
  if (Array.isArray(msgs)) msg.channel.deleteMessages(msgs).catch(() => {});
  else msg.channel.deleteMessage(msgs).catch(() => {});
};

// Warning punishment
export const punishWarn = async (msg: Message<TextChannel>, bot: HibikiClient, reason: string) => {
  const id = generateSnowflake();

  // Adds the warning to the user
  await bot.db.insertUserWarning({
    giver: bot.user.id,
    receiver: msg.author.id,
    guild: msg.channel.guild.id,
    id: id,
    reason: reason || "Automod",
  });

  return id;
};
