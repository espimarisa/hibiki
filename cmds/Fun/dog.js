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
    const body = await fetch("https://random.dog/woof.json").then(async res => await res.json().catch(() => {}));
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🐶 Woof!",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = dogCommand;
