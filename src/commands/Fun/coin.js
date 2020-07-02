const Command = require("../../structures/Command");

class coinCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["coinflip", "flip", "flipcoin"],
      description: "Flips a coin.",
      allowdms: true,
    });
  }

  run(msg) {
    const coin = ["heads", "tails"][Math.round(Math.random())];
    this.bot.embed("💰 Coin", `The coin landed on **${coin}**.`, msg);
  }
}

module.exports = coinCommand;
