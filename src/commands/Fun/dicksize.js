const Command = require("../../lib/structures/Command");

class slotsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["dick", "penissize"],
      args: "<member:member&fallback>",
      description: "Returns a member's dick size.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let inches = user.id % 7.1;
    if (user.id === "647269760782041133") inches = 0;
    if (user.id === "569490086547292160") inches = 1;
    if (user.bot) return msg.channel.createMessage(this.bot.embed("❌ Error", `I don't think **${user.username}** has a dick.`, "error"));

    // Adds a suffix to inches
    const suffix = a => {
      return a > 1 || a < 0 || a === 0 ? "es" : "";
    };

    const thedick = `8${"=".repeat(Math.round(inches.toFixed(2) / 2))}D`;
    msg.channel.createMessage(this.bot.embed("🍆 Dicksize", `**${user.username}**'s dicksize is **${inches.toFixed(1)} inch${suffix(inches)}**.\n ${thedick}`));
  }
}

module.exports = slotsCommand;
