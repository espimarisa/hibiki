const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class gelbooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["gb", "gel"],
      args: "[tags:string]",
      description: "Sends an image from Gelbooru.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body || !body[0].file_url) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    const random = Math.floor(Math.random() * body.length);

    if (body[random].file_url.endsWith(".webm") || body[random].file_url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].file_url}).`, "error"));
    }

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Gelbooru",
        color: 0x006FFA,
        image: {
          url: body[random].file_url,
        },
      },
    });
  }
}

module.exports = gelbooruCommand;
