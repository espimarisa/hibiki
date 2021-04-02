/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies any set punishments
 * @module automod/antiInvite
 */

import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { fullInviteRegex } from "../../utils/constants";
import { punishMute, punishWarn } from "./punishments";
const reason = "Sent an invite (Automod)";

export async function automodAntiInvite(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  const string = bot.localeSystem.getLocaleFunction(cfg?.guildLocale ? cfg?.guildLocale : bot.config.defaultLocale);

  // Checks if an invite was posted
  if (fullInviteRegex.test(msg.content)) {
    let warning = "";

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
      const pmsg = await msg.channel.createMessage({
        embed: {
          title: `⚠ ${string("global.AUTOMOD")}`,
          description: string("global.AUTOMOD_INVITES"),
          color: msg.convertHex("error"),
          footer: {
            text: `${string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
      setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
    }

    // Emits the event for logging
    bot.emit("automodAntiInvite", msg.channel.guild, msg.member.user, warning, msg.content);
  }
}
