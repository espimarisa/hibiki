const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class feetCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random ecchi/hentai feet picture.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg) {
    // Fetches the api
    let res = await fetch("https://nekos.life/api/v2/img/feet");
    let body = await res.json().catch(() => {});
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Feet",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = feetCommand;
