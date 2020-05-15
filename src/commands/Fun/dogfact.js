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
    const body = await fetch("https://dog-api.kinduff.com/api/facts").then(async res => await res.json().catch(() => {}));
    if (!body || !body.success) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the fact. Try again later."));
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🐶 Dog Fact", body.facts[0]));
  }
}

module.exports = dogfactCommand;
