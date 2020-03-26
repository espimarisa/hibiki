const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class catgirlcmd extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["neko"],
      description: "Sends a picture of a catgirl.",
      cooldown: 3
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("https://nekos.life/api/neko");
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🐾 Meow!",
        image: {
          url: body.neko,
        },
        color: this.bot.embed.colour("general"),
      }
    });
  }
}

module.exports = catgirlcmd;
