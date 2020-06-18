const Command = require("structures/Command");
const fetch = require("node-fetch");

class lewdfoxgirlCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["lewdkitsune"],
      description: "Sends a lewd foxgirl picture.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/lewdk").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    await msg.channel.createMessage({
      embed: {
        title: "🔞 Lewd Foxgirl",
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

module.exports = lewdfoxgirlCommand;
