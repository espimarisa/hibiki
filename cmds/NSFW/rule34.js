const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class rule34Command extends Command {
  constructor(...args) {
    super(...args, {
      args: "[tags:string]",
      aliases: ["paheal", "r34"],
      description: "Sends an image from Rule 34.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const res = await fetch(`https://r34-json-api.herokuapp.com/posts?tags=${encodeURIComponent(args.join(" "))}`);
    const body = await res.json();
    if (!body || !body[0]) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    if (body[0].sample_url.endsWith(".webm") || body[0].sample_url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].sample_url}).`, "error"));
    }
    const random = Math.floor(Math.random() * body.length);

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Rule 34",
        color: this.bot.embed.color("general"),
        image: {
          url: body[random].sample_url,
        },
      },
    });
  }
}

module.exports = rule34Command;
