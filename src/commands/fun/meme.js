const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class memeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["randommeme"],
      description: "Sends a random meme.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://meme-api.herokuapp.com/gimme").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the meme. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🤣 Meme",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = memeCommand;
