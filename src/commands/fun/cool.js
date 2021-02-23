const Command = require("../../structures/Command");

class coolCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["coolness", "howcool"],
      args: "[member:member&fallback]",
      description: "Calculates how cool a member is.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;
    const random = Math.floor(Math.random() * 99) + 1;
    this.bot.embed("😎 Cool", `**${user.username}** is **${random}%** cool.`, msg);
  }
}

module.exports = coolCommand;
