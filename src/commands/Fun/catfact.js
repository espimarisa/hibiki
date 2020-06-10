const Command = require("structures/Command");
const fetch = require("node-fetch");

class catfactCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kittyfact"],
      description: "Sends a random cat fact.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://catfact.ninja/fact").then(async res => await res.json().catch(() => {}));
    if (!body || !body.fact) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the fact. Try again later.", "error"));
    msg.channel.createMessage(this.bot.embed("🐱 Cat Fact", body.fact));
  }
}

module.exports = catfactCommand;
