const Command = require("structures/Command");
const fetch = require("node-fetch");

class catgirlCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["neko"],
      description: "Sends a picture of a catgirl.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/neko").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error", msg);

    msg.channel.createMessage({
      embed: {
        title: "🐾 Catgirl",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = catgirlCommand;
