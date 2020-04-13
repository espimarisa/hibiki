const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class gelbooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[tags:string]",
      aliases: ["gb", "gel"],
      description: "Sends an image from Gelbooru.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    let res = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join("%20"))}`);
    let body = await res.json();
    if (!body || !body[0].file_url) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    // Handles MP4 & WEBM
    if (body[0].file_url.endsWith(".webm") || body[0].file_url.endsWith(".mp4")) return msg.channel.createMessage(this.bot.embed("❌ Error", `This post is a video, and can't be embedded. You can view it [here](${body[0].file_url}).`, "error"));
    // Randomly gets an image
    let random = Math.floor(Math.random() * body.length);

    // Sends the embed
    if (typeof body[random] !== "undefined") {
      await msg.channel.createMessage({
        embed: {
          title: "🔞 Gelbooru",
          color: this.bot.embed.colour("general"),
          image: {
            url: body[random].file_url,
          },
        },
      });
    } else return msg.channel.createMessage(this.bot.embed("❌ Error", "Nothing was found.", "error"));
  }
}

module.exports = gelbooruCommand;
