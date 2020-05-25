const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class lewdcatgirlgifCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["lewdkitsunegif", "lewdnekogif"],
      description: "Sends a lewd catgirl gif.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/nsfw_neko_gif").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Lewd Catgirl Gif",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = lewdcatgirlgifCommand;
