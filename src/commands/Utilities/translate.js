const Command = require("../../structures/Command");
const fetch = require("node-fetch");

const ISOcodes = [
  "auto", "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca",
  "ceb", "ny", "zh-cn", "zh-tw", "co", "hr", "cs", "da", "nl", "en", "eo", "et",
  "tl", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "iw",
  "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "kk", "km",
  "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt",
  "mi", "mr", "mn", "my", "ne", "no", "ps", "fa", "pl", "pt", "ma", "ro", "ru",
  "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw",
  "sv", "tg", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "cy", "xh", "yi",
  "yo", "zu",
];

class translateCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["translatetext"],
      args: "[language:string] [text:string]",
      description: "Translates text between languages.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    let locale = "en";

    if (!args.length) return this.bot.embed("❌ Error", "No **text to convert** was given.", msg, "error");

    // Adjusts some locales
    if (args[0].toLowerCase().startsWith("se ")) {
      locale = "sv";
      args.shift();
    } else if (args[0].toLowerCase().startsWith("jp ")) {
      locale = "ja";
      args.shift();
    } else if (args[0].toLowerCase().startsWith("br ")) {
      locale = "pt";
      args.shift();
    }

    if (ISOcodes.includes(args[0].toLowerCase())) {
      locale = args.shift().toLowerCase();
    }

    const body = await fetch(
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto" +
      `&tl=${locale}&dt=t&q=${encodeURIComponent(args.join(" "))}`,
    ).then(res => res.json().catch(() => {}));

    if (!body || !body[0] || !body[0][0] || !body[0][0][1] || !body[2]) {
      return this.bot.embed("❌ Error", "No translation found.", msg, "error");
    }

    this.bot.embed(
      "🌍 Translate",
      `Translations may not be 100% accurate. \n ${body[0][0][1]} **(${body[2].toUpperCase()})** ➜ ${body[0][0][0]} **(${locale.toUpperCase()})**`,
      msg,
    );
  }
}

module.exports = translateCommand;
