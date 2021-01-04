/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies any set punishments
 * @module automod/antiInvite
 */

import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { fullInviteRegex } from "../../helpers/constants";
import { punishMute, punishWarn } from "./punishments";

export async function automodAntiInvite(msg: Message<TextChannel>, bot: HibikiClient, cfg: any) {
  // Checks if an invite was posted
  if (fullInviteRegex.test(msg.content)) {
    let warning;

    // Handles each type of punishment
    cfg.invitePunishments.forEach(async (punishment: string) => {
      if (punishment === "Warn") warning = await punishWarn(msg, bot, "Sent an invite (Automod)");
      if (punishment === "Purge") msg.delete();
      if (punishment === "Mute") punishMute(msg, bot, cfg, "Automod (AntiInvite)");
    });

    // If msgOnPunishment is on
    if (cfg.msgOnPunishment) {
      const pmsg = await msg.createEmbed(`⚠ ${msg.string("global.AUTOMOD")}`, msg.string("global.AUTOMOD_INVITES"), "error");
      setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
    }

    // Emits the event for logging
    bot.emit("automodantiInvite", msg.channel.guild, msg.member, msg.content, warning);
    await msg.member?.addRole(cfg.mutedRole, "Automod (AntiInvite)").catch(() => {});
  }
}
