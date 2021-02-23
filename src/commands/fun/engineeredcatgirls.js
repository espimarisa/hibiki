const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class engineeredcatgirlsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["gecg", "gecatgirl", "gecatgirls", "geneticallyengineeredcatgirls"],
      description: "Sends a genetically engineered catgirl meme.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/gecg").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🐾 Genetically Engineered Catgirls",
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

module.exports = engineeredcatgirlsCommand;
