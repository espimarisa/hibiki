const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class randomfactCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["randomfact", "uselessfact"],
      description: "Sends a random fact.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const res = await fetch("https://useless-facts.sameerkumar.website/api");
    const body = await res.json();
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🍀 Fact", body.data));
  }
}

module.exports = randomfactCommand;
