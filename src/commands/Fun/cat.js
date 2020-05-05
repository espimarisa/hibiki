const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class catCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitten", "kitty", "pussy", "randomcat"],
      description: "Sends a random cat picture.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("http://aws.random.cat/meow");
    const body = await res.json();
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🐱 Meow!",
        color: this.bot.embed.color("general"),
        image: {
          url: `${body.file}`,
        },
      },
    });
  }
}

module.exports = catCommand;
