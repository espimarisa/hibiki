const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class yandereCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[tags:string]",
      aliases: ["yande", "yd"],
      description: "Sends an image from Yande.re.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const res = await fetch(`https://yande.re/post.json?api_version=2&tags=${encodeURIComponent(args.join(" "))}`);
    const body = await res.json();
    if (!body || !body.posts.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    const random = Math.floor(Math.random() * body.posts.length);

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Yande.re",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.posts[random].sample_url,
        },
      },
    });
  }
}

module.exports = yandereCommand;
