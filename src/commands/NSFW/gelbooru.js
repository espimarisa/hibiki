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
    const res = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join(" "))}`);
    const body = await res.json().catch(() => {});
    if (!body || !body[0].file_url) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    if (body[0].file_url.endsWith(".webm") || body[0].file_url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].file}).`, "error"));
    }
    const random = Math.floor(Math.random() * body.length);

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Gelbooru",
        color: this.bot.embed.color("general"),
        image: {
          url: body[random].file_url,
        },
      },
    });
  }
}

module.exports = gelbooruCommand;
