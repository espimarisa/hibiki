const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class femdomCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a NSFW femdom image.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const body = await fetch("https://nekos.life/api/v2/img/femdom").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Femdom",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = femdomCommand;
