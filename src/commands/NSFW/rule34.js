const Command = require("structures/Command");
const fetch = require("node-fetch");

class rule34Command extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["paheal", "r34"],
      args: "[tags:string]",
      description: "Sends an image from Rule 34.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://r34-json-api.herokuapp.com/posts?tags=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body || !body[0]) return this.bot.embed("❌ Error", "No images were found.", msg, "error");
    const random = Math.floor(Math.random() * body.length);

    if (body[random].sample_url.endsWith(".webm") || body[random].sample_url.endsWith(".mp4")) {
      return this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].sample_url}).`, msg, "error");
    }

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Rule 34",
        color: 0xA8E5A2,
        image: {
          url: body[random].sample_url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = rule34Command;
