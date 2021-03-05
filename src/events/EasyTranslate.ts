import type { Emoji, Member, Message } from "eris";
import { Event } from "../classes/Event";

export class EasyTranslate extends Event {
  events = ["messageReactionAdd"];
  async run(_event: string, msg: Message, emoji: Emoji, member: Member) {
    if (!msg || !msg.author || !msg.content || !msg.channel || msg.channel.type !== 0) return;

    // Converts emojis into unicode
    const toUni = function (str: string) {
      if (str.length < 4) return str.codePointAt(0).toString(16);
      return `${str.codePointAt(0).toString(16)}-${str.codePointAt(2).toString(16)}`;
    };

    // Parses the emoji
    const [letter1, letter2] = toUni(emoji.name).split("-");

    const finalLetter1 = parseInt(letter1, 16) - 127397;
    const finalLetter2 = parseInt(letter2, 16) - 127397;
    let lang = String.fromCharCode(finalLetter1) + String.fromCharCode(finalLetter2);
    if (!/[A-Z]{2}/.test(lang)) return;

    // Fixes some other languages
    if (lang === "CZ") lang = "CS";
    if (lang === "JP") lang = "JA";
    else if (lang === "SE") lang = "SV";
    else if (lang === "BR") lang = "PT";

    const cfg = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (cfg?.easyTranslate === false) return;

    // Cooldown to avoid spam
    const cooldown = this.bot.cooldowns.get(`easytranslate:${msg.channel.id}`);
    if (cooldown) return;

    // 5 second cooldown
    this.bot.cooldowns.set(`easytranslate:${msg.channel.id}`, new Date());
    setTimeout(() => {
      this.bot.cooldowns.delete(`easytranslate:${msg.channel.id}`);
    }, 5000);

    let localeString = "";
    const userLocale = await this.bot.localeSystem.getUserLocale(msg.author.id, this.bot, true);
    if (userLocale) localeString = userLocale;
    else if (cfg?.guildLocale && !userLocale) localeString = cfg.guildLocale;
    const string = this.bot.localeSystem.getLocaleFunction(localeString);
    msg.string = string;

    this.bot.commands.find((c) => c.name === "translate").run(msg, null, [lang].concat(msg.content.split(" ")), true, member.user);
  }
}
