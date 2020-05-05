const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class foxCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["floof", "randomfox"],
      description: "Sends a random fox picture.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://randomfox.ca/floof/");
    const body = await res.json();

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🦊 Floof!",
        color: this.bot.embed.color("general"),
        image: {
          url: body.image,
        },
      },
    });
  }
}

module.exports = foxCommand;
