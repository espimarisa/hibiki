const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class danbooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[tags:string]",
      aliases: ["db", "donmai"],
      description: "Sends an image from Danbooru.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg, args) {
    // Fetches the API
    let res = await fetch(`https://danbooru.donmai.us/posts.json?&tags=${aencodeURIComponent(args.join("%20"))}`);
    let body = await res.json().catch(() => {});
    if (!body || !body[0].file_url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Either nothing was found or the image is restricted.", "error"));
    // Handles MP4 & WEBM
    if (body[0].file_url.endsWith(".webm") || body[0].file_url.endsWith(".mp4")) return msg.channel.createMessage(this.bot.embed("❌ Error", `This post is a video, and can't be embedded. You can view it [here](${body[0].file_url}).`, "error"));
    // Randomly gets an image
    let random = Math.floor(Math.random() * body.length);

    // Sends the embed
    if (typeof body[random] != "undefined") {
      await msg.channel.createMessage({
        embed: {
          title: "🔞 Danbooru",
          color: this.bot.embed.colour("general"),
          image: {
            url: body[random].file_url,
          },
        },
      });
    } else return msg.channel.createMessage(this.bot.embed("❌ Error", "Nothing was found.", "error"));
  }
}

module.exports = danbooruCommand;
