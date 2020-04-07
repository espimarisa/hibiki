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
    let res = await fetch(`https://r34-json-api.herokuapp.com/posts?tags=${encodeURIComponent(args.join("%20"))}`);
    let body = await res.json().catch(() => {});
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    // Handles MP4 & WEBM
    if (body[0].sample_url.endsWith(".webm") || body[0].sample_url.endsWith(".mp4")) return msg.channel.createMessage(this.bot.embed("❌ Error", `This post is a video, and can't be embedded. You can view it [here](${body[0].sample_url}).`, "error"));
    // Randomly gets an image
    let random = Math.floor(Math.random() * body.length);

    // Sends the embed
    if (typeof body[random] != "undefined") {
      await msg.channel.createMessage({
        embed: {
          title: "🔞 Rule 34",
          color: this.bot.embed.colour("general"),
          image: {
            url: body[random].sample_url,
          },
        },
      });
    } else return msg.channel.createMessage(this.bot.embed("❌ Error", "Nothing was found.", "error"));
  }
}

module.exports = rule34Command;
