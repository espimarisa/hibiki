const Command = require("../../lib/structures/Command");

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
    msg.channel.createMessage(this.bot.embed("🎲 Dice", `You rolled a **${num}**.`));
  }
}

module.exports = diceCommand;
