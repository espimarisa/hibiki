const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class dogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["puppy", "randomdog"],
      description: "Sends a random dog picture.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("https://api.weeb.sh/images/random?type=animal_dog", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🐶 Woof!",
        image: {
          url: body.url,
        },
        color: this.bot.embed.colour("general"),
      },
    });
  }
}

module.exports = dogCommand;
