const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class dogfactCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["puppyfact"],
      description: "Sends a random dog fact.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://dog-api.kinduff.com/api/facts");
    const body = await res.json();
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🐶 Dog Fact", body.facts[0]));
  }
}

module.exports = dogfactCommand;
