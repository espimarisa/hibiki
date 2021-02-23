const Command = require("../../structures/Command");

class voteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["dbl", "topgg"],
      description: "Gives a link to vote on top.gg.",
      requiredkeys: ["topgg"],
      allowdms: true,
    });
  }

  run(msg) {
    this.bot.embed(
      "🗳 Vote",
      `Vote for **${this.bot.user.username}** on top.gg [here](https://top.gg/bot/${this.bot.user.id}/vote). Each vote gives you cookies.`,
      msg,
    );
  }
}

module.exports = voteCommand;
