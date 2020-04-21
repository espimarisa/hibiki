const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class catfactCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kittyfact"],
      description: "Sends a random cat fact.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://catfact.ninja/fact");
    const body = await res.json();
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🐱 Cat Fact", body.fact));
  }
}

module.exports = catfactCommand;
