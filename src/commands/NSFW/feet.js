const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class feetCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random ecchi/hentai feet picture.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/feet").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Feet",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by nekos.life`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = feetCommand;
