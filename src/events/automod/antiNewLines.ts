import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { localizePunishments, tagUser } from "../../utils/format";
import { punishMute, punishWarn } from "./punishments";
const reason = "Newline spam (Automod)";

export async function automodAntiNewLine(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  if (!cfg.newlineThreshold) cfg.newlineThreshold = 10;
  const newLineAmt = msg.content.split("\n").length;
  if (newLineAmt <= cfg.newlineThreshold) return;
  const string = bot.localeSystem.getLocaleFunction(cfg?.locale ? cfg?.locale : bot.config.defaultLocale);

  cfg?.antiNewLinesPunishments.forEach(async (punishment: string) => {
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
  cfg.spamPunishments.forEach((p) => {
    const punishment = localizePunishments(string, p);
    localizedPunishments.push(punishment);
  });

  // Sends a message if msgOnPunishment is enabled
  if (cfg.msgOnPunishment) {
    const pmsg = await msg.createEmbed(
      `🔨 ${string("global.AUTOMOD_PUNISHED", {
        member: tagUser(msg.author),
        reason: string("global.NEWLINE_SPAM"),
        punishments: `${localizedPunishments.filter((p) => p !== string("moderation.PURGED")).join(` ${string("global.AND")} `)}`,
      })}`,
      null,
      "error",
    );

    setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
  }
}
