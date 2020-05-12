const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class safebooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["sb"],
      args: "[tags:string]",
      description: "Sends an image from Safebooru.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const body = await fetch(`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body || !body[0].image || !body[0].directory) return msg.channel.createMessage(this.bot.embed("❌ Error", "No images were found.", "error"));
    if (body[0].image.endsWith(".webm") || body[0].image.endsWith(".mp4")) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].image}).`, "error"));
    }
    const random = Math.floor(Math.random() * body.length);

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🖼 Safebooru",
        color: this.bot.embed.color("general"),
        image: {
          url: `https://safebooru.org/images/${body[random].directory}/${body[random].image}`,
        },
      },
    });
  }
}

module.exports = safebooruCommand;
