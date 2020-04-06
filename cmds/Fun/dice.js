const Command = require("../../lib/structures/Command");

class diceCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["die", "roll", "rolldie", "rolldice"],
      description: "Rolls a six-sided die.",
    });
  }

  run(msg) {
    // Randomly picks between 1 & 6
    let num = Math.floor(Math.random() * 6) + 1;
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🎲 Dice", `You rolled a **${num}**.`, "general"));
  }
}

module.exports = diceCommand;
