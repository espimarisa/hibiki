const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class e621Command extends Command {
  constructor(...args) {
    super(...args, {
      args: "[tags:string]",
      aliases: ["e6"],
      description: "Sends an image from e621.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg, args) {
    // Fetches the API
    let res = await fetch(`https://e621.net/posts.json?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join(" "))}`, {
      headers: { "User-Agent": `${this.bot.user.username}` },
    });
    let body = await res.json();
    if (!body || !body.posts[0] || !body.posts[0].file.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    let random = Math.floor(Math.random() * body.posts.length);
    if (body.posts[random].file.url.endsWith(".webm") || body.posts[random].file.url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body.posts[random].file.url}).`, "error"));
    }

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 e621",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.posts[random].file.url,
        },
      },
    });
  }
}

module.exports = e621Command;
