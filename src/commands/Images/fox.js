const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class foxCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["floof", "randomfox"],
      description: "Posts a random fox picture.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("https://randomfox.ca/floof/");
    let body = await res.json().catch(() => {});

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🦊 Floof!",
        image: {
          url: body.image,
        },
        color: this.bot.embed.colour("general"),
      },
    });
  }
}

module.exports = foxCommand;
