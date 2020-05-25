const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class autofillCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a list of Google Autofill results.",
      args: "<query:string>",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(args.join(" "))}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36",
      },
    }).then(async res => await res.json().catch(() => {}));

    if (!body || !body[1].length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No results found.", "error"));
    msg.channel.createMessage(this.bot.embed("✏ Autofill", body[1].join("\n")));
  }
}

module.exports = autofillCommand;
