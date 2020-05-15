const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class lewdnekoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["lewdkitsune", "lewdneko"],
      description: "Sends a lewd catgirl picture.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const body = await fetch("https://nekos.life/api/lewd/neko").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🔞 Lewd Catgirl",
        color: this.bot.embed.color("general"),
        image: {
          url: body.neko,
        },
      },
    });
  }
}

module.exports = lewdnekoCommand;
