const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class randomfactCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["randomfact", "uselessfact"],
      description: "Sends a random fact.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    const body = await fetch("https://useless-facts.sameerkumar.website/api").then(async res => await res.json().catch(() => {}));
    if (!body || !body.data) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the fact. Try again later.", "error"));
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🍀 Fact", body.data));
  }
}

module.exports = randomfactCommand;
