const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class lewdnekoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["lewdneko"],
      description: "Sends a lewd catgirl picture.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/lewdkemo").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Lewd Catgirl",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = lewdnekoCommand;
