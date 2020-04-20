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
    if (args.length > 2) return msg.channel.createMessage(this.bot.embed("❌ Error", "You can only search for 2 tags at a time.", "error"));
    const res = await fetch(`https://danbooru.donmai.us/posts.json?&tags=${encodeURIComponent(args.join(" "))}`);
    const body = await res.json();
    if (!body || !body[0] || !body[0].file_url) return msg.channel.createMessage(this.bot.embed("❌ Error", "No posts were found.", "error"));
    if (body[0].file_url.endsWith(".webm") || body[0].file_url.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].file_url}).`, "error"));
    }
    const random = Math.floor(Math.random() * body.length);
    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Danbooru",
        color: this.bot.embed.colour("general"),
        image: {
          url: body[random].file_url,
        },
      },
    });
  }
}

module.exports = danbooruCommand;
