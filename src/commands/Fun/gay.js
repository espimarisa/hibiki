const Command = require("../../lib/structures/Command");

class gayCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["calculategay", "gaylevel", "gayness"],
      args: "[member:member&fallback]",
      description: "Calculates how gay a member is.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;
    // Random 1 - 100%
    const random = Math.floor(Math.random() * 99) + 1;
    if (user.id === "647269760782041133") return msg.channel.createMessage(this.bot.embed("🏳️‍🌈 Lesbiab", `**${user.username}** is the gayest girl, ever. 💜💙`));
    if (user.id === "284432595905675264") return msg.channel.createMessage(this.bot.embed("CEO", `**${user.username}** is CEO`));
    msg.channel.createMessage(this.bot.embed("🏳️‍🌈 Gay", `**${user.username}** is **${random}%** gay!`));
  }
}

module.exports = gayCommand;
