/**
 * @fileoverview Automod antiSpam module
 * @description Attempts to detect spam and applies any set punishments
 * @module automod/antiSpam
 */

import type { Message, TextChannel } from "eris";

import type { HibikiClient } from "../../classes/Client";
import { localizePunishments, tagUser } from "../../utils/format";
import { validItems } from "../../utils/validItems";
import { punishMute, punishPurge, punishWarn } from "./punishments";

const punishedUsers: string[] = [];
const defaultPunishments = (validItems.find((item) => item.id === "spamPunishments").default as unknown) as string[];
const defaultThreshold = validItems.find((item) => item.id === "spamThreshold").default as number;

export async function automodAntiSpam(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  const string = bot.localeSystem.getLocaleFunction(cfg?.guildLocale ? cfg?.guildLocale : bot.config.defaultLocale);

  // Filters thru the antiSpam
  const spam = bot.antiSpam.filter(
    (s) => s.guild === msg.channel.guild.id && s.id === msg.author.id && new Date().getTime() - s.date < 2500,
  );

  if (!cfg.spamThreshold) cfg.spamThreshold = defaultThreshold;
  if (punishedUsers.indexOf(msg.author.id) !== -1) return;

  // If the spam threshold is met
  if (spam.length >= cfg.spamThreshold) {
    // Pushes to punished users to avoid repeated messages
    punishedUsers.push(msg.author.id);
    setTimeout(() => punishedUsers.splice(punishedUsers.indexOf(msg.author.id), 1), 5000);

    const punishments = cfg.spamPunishments ? cfg.spamPunishments : defaultPunishments;
    // Handles each type of spam punishment
    punishments.forEach(async (punishment: string) => {
      switch (punishment) {
        case "Mute":
          punishMute(msg, bot, cfg, spam);
          break;
        case "Purge":
          await punishPurge(
            msg,
            bot.antiSpam
              .filter((s) => s.guild === msg.channel.guild.id && s.id === msg.author.id && new Date().getTime() - s.date < 10000)
              .map((s) => s.msgid),
          );
          break;
        case "Warn":
          punishWarn(msg, bot, "Spam (Automod)");
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
            reason: string("global.SPAMMING"),
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

    // Waits a second between each
    bot.antiSpam.forEach((a) => {
      if (a.id !== msg.author.id) return;
      if (a.guild !== msg.channel.guild.id) return;
      bot.antiSpam.splice(bot.antiSpam.indexOf(a), 1);
    });
  }

  // Pushes the antiSpam object
  bot.antiSpam.push({
    date: new Date().getTime(),
    id: msg.author.id,
    guild: msg.channel.guild.id,
    content: msg.content,
    msgid: msg.id,
  });
}
