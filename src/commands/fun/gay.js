const Command = require("../../structures/Command");

class gayCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Calculates how gay a member is.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;
    const random = Math.floor(Math.random() * 99) + 1;
    if (user.id === "647269760782041133") return this.bot.embed("🏳️‍🌈 Lesbiab", `**${user.username}** is the gayest girl, ever. 💜💙`, msg);
    else if (user.id === "719523922726617188") return this.bot.embed("🏳️‍🌈 Lesbiab", `**  ${user.username}** is 1000000% gay and very cute 💙💜`, msg);
    else this.bot.embed("🏳️‍🌈 Gay", `**${user.username}** is **${random}%** gay.`, msg);
  }
}

module.exports = gayCommand;
