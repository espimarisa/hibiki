const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class lewdcatgirlgifCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["lewdcatgirlgif", "lewdkitsunegif"],
      description: "Posts a NSFW catgirl gif.",
      cooldown: 3,
      nsfw: true,
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("https://nekos.life/api/v2/img/nsfw_neko_gif");
    let body = await res.json().catch(() => {});
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Lewd Catgirl Gif",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = lewdcatgirlgifCommand;
