const Command = require("structures/Command");
const fetch = require("node-fetch");

class e621Command extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["e6"],
      args: "[tags:string]",
      description: "Sends an image from e621.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://e621.net/posts.json?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join(" "))}`, {
      headers: { "User-Agent": `${this.bot.user.username}/${this.bot.version}` },
    }).then(async res => await res.json().catch(() => {}));
    if (!body || !body.posts[0] || !body.posts[0].file.url || !body.posts.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    const random = Math.floor(Math.random() * body.posts.length);

    if (body.posts[random].file.url.endsWith(".webm") || body.posts[random].file.url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body.posts[0].file.url}).`, "error"));
    }

    await msg.channel.createMessage({
      embed: {
        title: "🔞 e621",
        color: 0xFCBF31,
        image: {
          url: body.posts[random].file.url,
        },
      },
    });
  }
}

module.exports = e621Command;
