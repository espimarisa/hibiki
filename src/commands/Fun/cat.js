const Command = require("structures/Command");
const fetch = require("node-fetch");

class catCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitten", "kitty", "pussy", "randomcat"],
      description: "Sends a random cat picture.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("http://aws.random.cat/meow").then(async res => await res.json().catch(() => {}));
    if (!body || !body.file) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    msg.channel.createMessage({
      embed: {
        title: "🐱 Meow!",
        color: this.bot.embed.color("general"),
        image: {
          url: body.file,
        },
      },
    });
  }
}

module.exports = catCommand;
