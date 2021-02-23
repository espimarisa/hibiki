const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class foxCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["floof", "randomfox"],
      description: "Sends a random fox picture.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://randomfox.ca/floof/").then(res => res.json().catch(() => {}));
    if (!body || !body.image) return this.bot.embed("❌ Error", "Couldn't send the image. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🦊 Floof!",
        color: this.bot.embed.color("general"),
        image: {
          url: body.image,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by randomfox.ca`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = foxCommand;
