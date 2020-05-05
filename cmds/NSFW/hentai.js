const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class hentaiCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random hentai image.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://nekos.life/api/v2/img/solo");
    const body = await res.json();
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Hentai",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = hentaiCommand;
