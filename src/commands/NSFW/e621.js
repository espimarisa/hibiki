const Command = require("../../structures/Command");
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
      headers: {
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(async res => await res.json().catch(() => {}));

    if (!body || !body.posts[0] || !body.posts[0].file || !body.posts[0].file.url || !body.posts.length) {
      return this.bot.embed("❌ Error", "No images were found.", msg, "error");
    }

    const random = Math.floor(Math.random() * body.posts.length);
    if (body.posts[random].file.url.endsWith(".webm") ||
      body.posts[random].file.url.endsWith(".mp4") ||
      body.posts[random].file.url.endsWith(".swf")) {
      return this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body.posts[0].file.url}).`, msg, "error");
    }

    await msg.channel.createMessage({
      embed: {
        title: "🔞 e621",
        color: 0xFCBF31,
        image: {
          url: body.posts[random].file.url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = e621Command;
