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
    const res = await fetch("https://api.weeb.sh/images/random?type=animal_cat", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    const body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🐱 Meow!",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: "Powered by weeb.sh",
        },
      },
    });
  }
}

module.exports = catCommand;
