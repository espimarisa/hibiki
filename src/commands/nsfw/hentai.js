const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class hentaiCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random hentai image.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/solo").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🔞 Hentai",
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

module.exports = hentaiCommand;
