const Command = require("../../structures/Command");

class diceCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["die", "roll", "rolldie", "rolldice"],
      description: "Rolls a six-sided die.",
      allowdms: true,
    });
  }

  run(msg) {
    const num = Math.floor(Math.random() * 6) + 1;
    this.bot.embed("🎲 Dice", `You rolled a **${num}**.`, msg);
  }
}

module.exports = diceCommand;
