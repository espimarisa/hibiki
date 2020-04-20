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
    const res = await fetch("https://api.weeb.sh/images/random?type=animal_dog", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    const body = await res.json();

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🐶 Woof!",
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

module.exports = dogCommand;
