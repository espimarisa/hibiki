const Event = require("../structures/Event");
const fetch = require("node-fetch");

class easyTranslate extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageReactionAdd",
    });
  }

  async run(msg, emoji, uid) {
    if (!msg || !msg.author || !msg.content || !msg.channel || msg.channel.type !== 0) return;
    const reactioner = this.bot.users.find(m => m.id === uid);

    // Converts emojis into unicode
    const toUni = function(str) {
      if (str.length < 4)
        return str.codePointAt(0).toString(16);
      return `${str.codePointAt(0).toString(16)}-${str.codePointAt(2).toString(16)}`;
    };

    // Parses the emoji
    let [letter1, letter2] = toUni(emoji.name).split("-");
    letter1 = parseInt(letter1, 16) - 127397;
    letter2 = parseInt(letter2, 16) - 127397;
    let lang = String.fromCharCode(letter1) + String.fromCharCode(letter2);
    if (!/[A-Z]{2}/.test(lang)) return;

    // Fixes some other languages
    if (lang === "JP") lang = "JA";
    else if (lang === "SE") lang = "SV";
    else if (lang === "BR") lang = "PT";

    // Gets config
    const cfg = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    if (cfg && cfg.easyTranslate === false) return;

    // Cooldown to avoid spam
    const cooldown = this.bot.cooldowns.find(cd => cd === `easytranslate:${msg.channel.id}`);
    if (cooldown) return;

    // 5 second cooldown
    this.bot.cooldowns.push(`easytranslate:${msg.channel.id}`);
    setTimeout(() => {
      this.bot.cooldowns.splice(this.bot.cooldowns.indexOf(`easytranslate:${msg.channel.id}`), 1);
    }, 5000);

    // Fetches the API
    const body = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(msg.content)}`,
    ).then(res => res.json().catch(() => {}));

    if (!body || !body[0] || !body[0][0]) return;

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        description: `${body[0][0][0]}`,
        timestamp: new Date(msg.timestamp),
        author: {
          name: `${this.bot.tag(msg.author)} said... `,
          icon_url: msg.author.dynamicAvatarURL(),
        },
        image: {
          url: msg.attachment,
        },
        footer: {
          text: `Translated by ${this.bot.tag(reactioner)} from ${body[2].toUpperCase()} to ${lang.toUpperCase()}.`,
          icon_url: reactioner ? reactioner.dynamicAvatarURL() : null,
        },
      },
    }).catch(() => {});
  }
}

module.exports = easyTranslate;
