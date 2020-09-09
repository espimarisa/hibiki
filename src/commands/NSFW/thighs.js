const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class thighsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["thigh"],
      description: "Sends a NSFW IRL thigh picture.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekobot.xyz/api/image?type=thigh").then(res => res.json().catch(() => {}));
    if (!body || !body.message) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🔞 Thighs",
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

module.exports = thighsCommand;
