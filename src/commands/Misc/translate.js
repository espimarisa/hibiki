const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");
const ISOcodes = ["auto", "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "ny", "zh-cn", "zh-tw", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "tl", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "iw", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "kk", "km", "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "ps", "fa", "pl", "pt", "ma", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "cy", "xh", "yi", "yo", "zu"];

class translateCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["translatetext"],
      args: "<language:string> <text:string>",
      description: "Translates text between languages.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Adjusts locales
    let locale = "en";
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

    // Fetches the API
    const body = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${locale}&dt=t&q=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));

    // If no body or info
    if (!body || !body[0] || !body[0][0] || !body[0][0][1] || !body[2]) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No translation found.", "errro"));
    }

    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🌍 Translate", `Possibly innacurate due to language barriers. \n ${body[0][0][1]} **(${body[2].toUpperCase()})** => ${body[0][0][0]} **(${locale.toUpperCase()})**`)).catch(() => {});
  }
}

module.exports = translateCommand;
