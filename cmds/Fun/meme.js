const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class memeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["randommeme"],
      description: "Sends a random meme.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const body = await fetch("https://meme-api.herokuapp.com/gimme").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the meme. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🤣 Random Meme",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = memeCommand;
