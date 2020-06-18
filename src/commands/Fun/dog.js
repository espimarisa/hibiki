const Command = require("structures/Command");
const fetch = require("node-fetch");

class dogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["puppy", "randomdog"],
      description: "Sends a random dog picture.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://random.dog/woof.json").then(async res => await res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    await msg.channel.createMessage({
      embed: {
        title: "🐶 Dog",
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

module.exports = dogCommand;
