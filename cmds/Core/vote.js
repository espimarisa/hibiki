const Command = require("../../lib/structures/Command");

class voteCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives a link to vote on top.gg.",
    });
  }

  run(msg) {
    // Sends if no top.gg key is provided (forks shouldn't have one)
    if (!this.bot.key.topgg) return msg.channel.createMessage(this.bot.embed("❌ Error", "This instance isn't configured for top.gg.", "error"));
    msg.channel.createMessage(this.bot.embed("🗳 Vote", `You can vote for **${this.bot.user.username}** on top.gg [here](https://top.gg/bot/${this.bot.user.id}/vote). Each vote gives **150** cookies.`, "general"));
  }
}

module.exports = voteCommand;
