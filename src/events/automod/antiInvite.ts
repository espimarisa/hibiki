/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies any set punishments
 * @module automod/antiInvite
 */

import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { fullInviteRegex } from "../../helpers/constants";
import { punishMute, punishWarn } from "./punishments";
const reason = "Sent an invite (Automod)";

export async function automodAntiInvite(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  const userLocale = await bot.localeSystem.getUserLocale(msg.author.id, bot);
  const string = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;

  // Checks if an invite was posted
  if (fullInviteRegex.test(msg.content)) {
    let warning: string;

    // Handles each type of punishment
    cfg.invitePunishments.forEach(async (punishment: string) => {
      switch (punishment) {
        case "Warn":
          warning = await punishWarn(msg, bot, reason);
          break;
        case "Purge":
          msg.delete();
          break;
        case "Mute":
          punishMute(msg, bot, cfg, reason);
          break;
      }
    });

    // If msgOnPunishment is on
    if (cfg.msgOnPunishment) {
      const pmsg = await msg.createEmbed(`⚠ ${string("global.AUTOMOD")}`, string("global.AUTOMOD_INVITES"), "error");
      setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
    }

    // Emits the event for logging
    bot.emit("automodAntiInvite", msg.channel.guild, msg.member.user, msg.content, warning);
    await msg.member?.addRole(cfg.mutedRole, reason).catch(() => {});
  }
}
