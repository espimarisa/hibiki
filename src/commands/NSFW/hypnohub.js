const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class hypnohubCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[tags:string]",
      aliases: ["hypno"],
      description: "Sends an image from Hypnohub.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg, args) {
    // Fetches the API
    let res = await fetch(`https://hypnohub.net/post.json?api_version=2&tags=${encodeURIComponent(args.join(" "))}`);
    let body = await res.json().catch(() => {});
    if (!body || !body.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    let random = Math.floor(Math.random() * body.posts.length);

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Hypnohub",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.posts[random].sample_url,
        },
      },
    });
  }
}

module.exports = hypnohubCommand;
