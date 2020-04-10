const Command = require("../../lib/structures/Command");

class supportCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives an invite to the support server.",
    });
  }

  run(msg) {
    if (!this.bot.cfg.support) return msg.channel.createMessage(this.bot.embed("❌ Error", "No support server invite set.", "error"))
    msg.channel.createMessage(this.bot.embed("❓ Support", `You can join the support server with [this link](https://discord.gg/${this.bot.cfg.support}).`, "general"));
  }
}

module.exports = supportCommand;
