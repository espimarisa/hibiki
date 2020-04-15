const Command = require("../../lib/structures/Command");

class coolCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["calculatecool", "coolness", "howcool"],
      args: "[user:user&fallback]",
      description: "Calculates how cool a user is.",
    });
  }

  run(msg, args, pargs) {
    let user = pargs[0].value;
    // Random 1 - 100%
    let random = Math.floor(Math.random() * 99) + 1
    msg.channel.createMessage(this.bot.embed("😎 Cool", `**${user.username}** is **${random}%** cool!`));
  }
}

module.exports = coolCommand;
