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
    // Filters specific content
    const search = args.join("").toLowerCase();
    if (search.includes("hibiki") || search.includes("loli") || search.includes("shota") || search.includes("cub")) {
      msg.channel.createMessage({
        embed: {
          title: "❌ Disgusting...",
          color: this.bot.embed.color("error"),
          image: {
            url: "https://i.imgur.com/evfz3WI.png",
          },
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });

      // Logs TOS breakers
      return this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          color: this.bot.embed.color("error"),
          author: {
            name: `${this.bot.tag(msg.author)} (${msg.author.id}) searched for ${search} on ${this.id}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }

    const body = await fetch(`https://e621.net/posts.json?&s=post&q=index&json=1?limit=200&tags=${encodeURIComponent(args.join(" "))}`, {
      headers: {
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));

    // This is utterly fucking retarded. When will Node.js target ES2020 so we can just use ??.
    if (!body || body && body && !body.posts[0] || body && body.posts && !body.posts[0].file || body && body.posts && !body.posts[0].file.url || !body && body.posts && body.posts.length || body && body.success === false) {
      return this.bot.embed("❌ Error", "No images were found.", msg, "error");
    }

    const random = Math.floor(Math.random() * body.posts.length);
    if (body && body.posts && body.posts[random] && body.posts[random].file.url &&
      body.posts[random].file.url.endsWith(".webm") ||
      body && body.posts && body.posts[random].file.url.endsWith(".mp4") ||
      body && body.posts && body.posts[random].file.url.endsWith(".swf")) {
      return this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body.posts[0].file.url}).`, msg, "error");
    }

    msg.channel.createMessage({
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
