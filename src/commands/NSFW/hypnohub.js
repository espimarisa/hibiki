const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class hypnohubCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["hypno"],
      args: "[tags:string]",
      description: "Sends an image from Hypnohub.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://hypnohub.net/post.json?api_version=2&tags=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    const random = Math.floor(Math.random() * body.posts.length);

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Hypnohub",
        color: 0xFDEA73,
        image: {
          url: body.posts[random].sample_url,
        },
      },
    });
  }
}

module.exports = hypnohubCommand;
