const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class lewdnekoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["lewdneko"],
      description: "Sends a NSFW catgirl image.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://nekos.life/api/lewd/neko");
    const body = await res.json();
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Lewd Catgirl",
        color: this.bot.embed.color("general"),
        image: {
          url: body.neko,
        },
      },
    });
  }
}

module.exports = lewdnekoCommand;
