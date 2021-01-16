/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies any set punishments
 * @module automod/antiInvite
 */

import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { punishMute, punishWarn } from "./punishments";
const reason = "Mass mention (Automod)";

export async function automodAntiMassMention(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  const userLocale = await bot.localeSystem.getUserLocale(msg.author.id, bot);
  const string = bot.localeSystem.getLocaleFunction(userLocale);

  if (!cfg.massMentionThreshold) cfg.massMentionThreshold = 8;
  if (msg.mentions.length >= cfg.massMentionThreshold) {
    // Handles each type of punishment
    cfg.antiMassMentionPunishments.forEach(async (punishment: string) => {
      switch (punishment) {
        case "Warn":
          await punishWarn(msg, bot, reason);
          break;
        case "Purge":
          msg.delete();
          break;
        case "Mute":
          punishMute(msg, bot, cfg, reason);
          break;
      }
    });

    // Sends a message if msgOnPunishment is enabled
    if (cfg.msgOnPunishment) {
      const pmsg = await msg.createEmbed(
        `🔨 ${msg.author.username} ${string("global.HAS_BEEN")} ${cfg.spamPunishments
          .map((p: string) => `${p.toLowerCase()}`)
          .filter((p: string) => p !== "purged")
          .join(` ${string("global.AND")} `)} ${string("global.FOR_MASSMENTIONING")}.`,
        null,
        "error",
      );

      setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
    }
  }
}
