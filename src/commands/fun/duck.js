const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class duckCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random picture of a duck.",
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://random-d.uk/api/v1/random").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🦆 Duck",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by random-d.uk`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = duckCommand;
