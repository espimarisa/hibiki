const Command = require("../../lib/structures/Command");

class gayCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["calculategay", "gaylevel", "gayness"],
      args: "[user:member&fallback]",
      description: "Calculates how gay a user is.",
    });
  }

  run(msg, args, pargs) {
    let user = pargs[0].value;
    // Random 1 - 100%
    let random = Math.floor(Math.random() * 99) + 1
    if (user.id === "647269760782041133") return msg.channel.createMessage(this.bot.embed("🏳️‍🌈 Lesbiab", `**${user.username}** is the gayest girl, ever. 💜💙`));
    msg.channel.createMessage(this.bot.embed("🏳️‍🌈 Gay", `**${user.username}** is **${random}%** gay!`));
  }
}

module.exports = gayCommand;
