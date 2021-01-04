import type { Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { punishMute, punishWarn } from "./punishments";
const reason = "Newline spam (Automod)";

export async function automodAntiNewLine(msg: Message<TextChannel>, bot: HibikiClient, cfg: GuildConfig) {
  if (!cfg.newlineThreshold) cfg.newlineThreshold = 10;

  const newLineAmt = msg.content.split("\n").length;
  if (newLineAmt <= cfg.newlineThreshold) return;

  const userLocale = await bot.localeSystem.getUserLocale(msg.author.id, bot);
  const string = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;

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

  // Sends a message if msgOnPunishment is enabled
  if (cfg.msgOnPunishment) {
    const pmsg = await msg.createEmbed(
      `🔨 ${msg.author.username} ${string("global.HAS_BEEN")} ${cfg.spamPunishments
        .map((p: string) => `${p.toLowerCase()}`)
        .filter((p: string) => p !== "purged")
        .join(` ${string("global.AND")} `)} ${string("global.FOR_SPAMMING")}.`,
      null,
      "error",
    );

    setTimeout(() => pmsg.delete("Automod message deletion").catch(() => {}), 5000);
  }
}
