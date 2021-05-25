/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies any set punishments
 * @module automod/antiInvite
 */

import type { Message, TextChannel } from "eris";

import type { HibikiClient } from "../../classes/Client";
import { localizePunishments, tagUser } from "../../utils/format";
import { validItems } from "../../utils/validItems";
import { punishMute, punishWarn } from "./punishments";

const reason = "Mass mention (Automod)";
const defaultPunishments = (validItems.find((item) => item.id === "antiMassMentionPunishments").default as unknown) as string[];
const defaultThreshold = validItems.find((item) => item.id === "massMentionThreshold").default as number;

export async function automodAntiMassMention(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  const string = bot.localeSystem.getLocaleFunction(cfg?.guildLocale ? cfg?.guildLocale : bot.config.defaultLocale);
  if (!cfg.massMentionThreshold) cfg.massMentionThreshold = defaultThreshold;
  if (msg.mentions.length + msg.roleMentions.length >= cfg.massMentionThreshold) {
    const punishments = cfg.antiMassMentionPunishments ? cfg.antiMassMentionPunishments : defaultPunishments;
    // Handles each type of punishment
    punishments.forEach(async (punishment: string) => {
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
    punishments.forEach((p) => {
      const punishment = localizePunishments(string, p);
      localizedPunishments.push(punishment);
    });

    // Sends a message if msgOnPunishment is enabled
    if (cfg.msgOnPunishment) {
      const pmsg = await msg.channel.createMessage({
        embed: {
          title: `🔨 ${string("global.AUTOMOD_PUNISHED", {
            member: tagUser(msg.author),
            reason: string("global.MASS_MENTIONING"),
            punishments: `${
              localizedPunishments.length > 1
                ? localizedPunishments.filter((p) => p !== string("moderation.PURGED")).join(` ${string("global.AND")} `)
                : localizedPunishments[0]
            }`,
          })}`,
          color: msg.convertHex("error"),
        },
      });

      setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
    }
  }
}
