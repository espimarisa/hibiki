const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class catgirlCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["neko"],
      description: "Sends a picture of a catgirl.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://nekos.life/api/v2/img/neko");
    const body = await res.json();
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🐾 Mew!",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = catgirlCommand;
