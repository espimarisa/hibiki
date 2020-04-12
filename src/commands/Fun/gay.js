const Command = require("../../lib/structures/Command");

class gayCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["calculategay", "gaylevel", "gayness"],
      args: "[user:user&fallback]",
      description: "Calculates how gay a user is.",
    });
  }

  async run(msg, args, pargs) {
    let user = pargs[0].value;
    // Random percent, 1 - 100%
    let random = Math.floor(Math.random() * 99) + 1
    // Sends the embed
    if (user.id === "647269760782041133") return msg.channel.createMessage(this.bot.embed("🏳️‍🌈 Lesbiab", `**${user.username}** is the gayest girl, ever. 💜💙`, "general"));
    msg.channel.createMessage(this.bot.embed("🏳️‍🌈 Gay", `**${user.username}** is **${random}%** gay!`, "general"));
  }
}

module.exports = gayCommand;
