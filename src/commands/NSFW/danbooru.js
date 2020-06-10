const Command = require("structures/Command");
const fetch = require("node-fetch");

class danbooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["db", "donmai"],
      args: "[tags:string]",
      description: "Sends an image from Danbooru.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    if (args.length > 2) return msg.channel.createMessage(this.bot.embed("❌ Error", "You can only search for 2 tags at a time.", "error"));
    const body = await fetch(`https://danbooru.donmai.us/posts.json?&tags=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body || !body[0] || !body[0].file_url || !body.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No posts were found.", "error"));
    const random = Math.floor(Math.random() * body.length);

    if (body[random].file_url.endsWith(".webm") || body[random].file_url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].file_url}).`, "error"));
    }

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Danbooru",
        color: 0x006FFA,
        image: {
          url: body[random].file_url,
        },
      },
    });
  }
}

module.exports = danbooruCommand;
