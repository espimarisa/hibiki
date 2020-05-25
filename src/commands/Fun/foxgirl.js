const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class catgirlCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitsune"],
      description: "Sends a picture of a foxgirl.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/fox_girl").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    msg.channel.createMessage({
      embed: {
        title: "🦊 Foxgirl",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = catgirlCommand;
