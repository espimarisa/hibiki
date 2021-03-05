/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies any set punishments
 * @module automod/antiInvite
 */

import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { localizePunishments, tagUser } from "../../utils/format";
import { punishMute, punishWarn } from "./punishments";
const reason = "Mass mention (Automod)";

export async function automodAntiMassMention(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  const string = bot.localeSystem.getLocaleFunction(cfg?.guildLocale ? cfg?.guildLocale : bot.config.defaultLocale);

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

    // Localizes punishments
    const localizedPunishments: string[] = [];
    cfg.spamPunishments.forEach((p) => {
      const punishment = localizePunishments(string, p);
      localizedPunishments.push(punishment);
    });

    // Sends a message if msgOnPunishment is enabled
    if (cfg.msgOnPunishment) {
      const pmsg = await msg.createEmbed(
        `🔨 ${string("global.AUTOMOD_PUNISHED", {
          member: tagUser(msg.author),
          reason: string("global.MASS_MENTIONING"),
          punishments: `${localizedPunishments.filter((p) => p !== string("moderation.PURGED")).join(` ${string("global.AND")} `)}`,
        })}`,
        null,
        "error",
      );

      setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
    }
  }
}
