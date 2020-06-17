const Command = require("structures/Command");
const fetch = require("node-fetch");

class catCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitten", "kitty", "pussy", "randomcat"],
      description: "Sends a random cat picture.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("http://aws.random.cat/meow").then(async res => await res.json().catch(() => {}));

    if (!body || !body.file) {
      return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg.author, "error");
    }

    msg.channel.createMessage({
      embed: {
        title: "🐱 Cat",
        color: this.bot.embed.color("general"),
        image: {
          url: body.file,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = catCommand;
