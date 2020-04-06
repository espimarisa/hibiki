const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class randommemeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["meme"],
      description: "Posts a random meme.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("https://meme-api.herokuapp.com/gimme");
    let body = await res.json().catch(() => {});
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the meme. Try again later.", "error"));

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🤣 Random Meme",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
      },
    });
  }
}

module.exports = randommemeCommand;
