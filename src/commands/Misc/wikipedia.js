const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class wikipediaCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["wiki"],
      args: "<query:string>",
      description: "Returns information from Wikipedia.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const body = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(args.join(" ").toLowerCase())}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Page not found.", "error"));
    // Handles error & disambiguation pages
    if (body.title === "Not found.") return msg.channel.createMessage(this.bot.embed("❌ Error", "Page not found.", "error"));
    if (body.type === "disambiguation") {
      return msg.channel.createMessage(this.bot.embed("🌐 Wikipedia", `[Page](${body.content_urls.desktop.page}) is a disambiguation.`));
    }
    // Sends the embed
    msg.channel.createMessage(this.bot.embed(`🌐 ${body.title}`, body.extract));
  }
}

module.exports = wikipediaCommand;
