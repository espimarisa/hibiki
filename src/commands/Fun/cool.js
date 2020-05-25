const Command = require("../../lib/structures/Command");

class coolCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["calculatecool", "coolness", "howcool"],
      args: "[member:member&fallback]",
      description: "Calculates how cool a member is.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;
    const random = Math.floor(Math.random() * 99) + 1;
    if (user.id === "284432595905675264") return msg.channel.createMessage(this.bot.embed("😎 CEO", `**${user.username}** is **CEO**`));
    msg.channel.createMessage(this.bot.embed("😎 Cool", `**${user.username}** is **${random}%** cool!`));
  }
}

module.exports = coolCommand;
