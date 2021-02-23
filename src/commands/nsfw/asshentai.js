const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class asshentaiCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ahentai"],
      description: "Sends a random ass ecchi/hentai picture.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekobot.xyz/api/image?type=hass").then(res => res.json().catch(() => {}));
    if (!body || !body.message) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🔞 Ass Hentai",
        color: this.bot.embed.color("general"),
        image: {
          url: body.message,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by api.nekobot.xyz`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = asshentaiCommand;
