const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class foxgirlCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitsune"],
      description: "Sends a picture of a foxgirl.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/fox_girl").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🦊 Foxgirl",
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

module.exports = foxgirlCommand;
