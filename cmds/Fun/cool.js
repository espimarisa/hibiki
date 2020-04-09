const Command = require("../../lib/structures/Command");

class coolCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["calculatecool", "coolness", "howcool"],
      args: "[user:user&fallback]",
      description: "Calculates how cool a user is.",
    });
  }

  async run(msg, args, pargs) {
    let user = pargs[0].value;
    // Random percent, 1 - 100%
    let random = Math.floor(Math.random() * 99) + 1
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("😎 Cool", `**${user.username}** is **${random}%** cool!`, "general"));
  }
}

module.exports = coolCommand;
