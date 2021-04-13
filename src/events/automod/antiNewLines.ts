import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { localizePunishments, tagUser } from "../../utils/format";
import { validItems } from "../../utils/validItems";
import { punishMute, punishWarn } from "./punishments";
const reason = "Newline spam (Automod)";

const defaultPunishments = (validItems.find((item) => item.id === "antiNewLinesPunishments").default as unknown) as string[];
const defaultThreshold = validItems.find((item) => item.id === "newlineThreshold").default as number;

export async function automodAntiNewLine(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  if (!cfg.newlineThreshold) cfg.newlineThreshold = defaultThreshold;
  const newLineAmt = msg.content.split(/\n$|^\n|^\s*$/m).length;
  if (newLineAmt <= cfg.newlineThreshold) return;
  const string = bot.localeSystem.getLocaleFunction(cfg?.guildLocale ? cfg?.guildLocale : bot.config.defaultLocale);

  const punishments = cfg.antiNewLinesPunishments ? cfg.antiNewLinesPunishments : defaultPunishments;

  punishments.forEach(async (punishment: string) => {
    switch (punishment) {
      case "Mute":
        punishMute(msg, bot, cfg, reason);
        break;
      case "Purge":
        msg.delete(reason);
        break;
      case "Warn":
        punishWarn(msg, bot, reason);
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
          reason: string("global.NEWLINE_SPAM"),
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
