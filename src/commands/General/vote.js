const Command = require("../../lib/structures/Command");

class voteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["dbl", "topgg"],
      description: "Gives a link to vote on top.gg.",
      requiredkeys: ["topgg"],
    });
  }

  run(msg) {
    msg.channel.createMessage(this.bot.embed("🗳 Vote", `You can vote for **${this.bot.user.username}** on top.gg [here](https://top.gg/bot/${this.bot.user.id}/vote). Each vote gives **150** cookies.`));
  }
}

module.exports = voteCommand;
