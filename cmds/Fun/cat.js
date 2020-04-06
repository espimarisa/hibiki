const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class catCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitten", "kitty", "pussy", "randomcat"],
      description: "Posts a random cat picture.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("http://aws.random.cat/meow");
    let body = await res.json().catch(() => {});

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🐱 Meow!",
        image: {
          url: body.file,
        },
        color: this.bot.embed.colour("general"),
      },
    });
  }
}

module.exports = catCommand;
