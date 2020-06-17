const Command = require("structures/Command");

class gayCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Calculates how gay a member is.",
    });
  }

  run(msg, args, pargs) {
    const member = pargs[0].value;
    const random = Math.floor(Math.random() * 99) + 1;
    if (user.id === "647269760782041133") return this.bot.embed("🏳️‍🌈 Lesbiab", `**${member.username}** is the gayest girl, ever. 💜💙`, msg);
    this.bot.embed("🏳️‍🌈 Gay", `**${member.username}** is **${random}%** gay.`, msg);
  }
}

module.exports = gayCommand;
