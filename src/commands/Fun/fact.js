const Command = require("structures/Command");
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
    const body = await fetch("https://useless-facts.sameerkumar.website/api").then(async res => await res.json().catch(() => {}));
    if (!body || !body.data) return this.bot.embed("❌ Error", "Couldn't send the fact. Try again later.", "error", msg);
    this.bot.embed("🍀 Fact", body.data, msg);
  }
}

module.exports = randomfactCommand;
