const Command = require("../../lib/structures/Command");

class coinCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["coinflip", "flip", "flipcoin"],
      description: "Flips a coin.",
    });
  }

  run(msg) {
    // Flips the coin
    let coin = ["heads", "tails"][Math.round(Math.random())];
    msg.channel.createMessage(this.bot.embed("💰 Coin", `The coin landed on **${coin}**.`));
  }
}

module.exports = coinCommand;
