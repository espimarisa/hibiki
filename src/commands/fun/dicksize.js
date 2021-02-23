const Command = require("../../structures/Command");

class dicksizeCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member&fallback>",
      description: "Returns you or another member's dicksize.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const inches = user.id % 7.1;
    if (user.bot) return this.bot.embed("❌ Error", `I don't think **${user.username}** has a dick.`, msg, "error");

    const suffix = a => {
      return a > 1 || a < 0 || a === 0 ? "es" : "";
    };

    const thedick = `8${"=".repeat(Math.round(inches.toFixed(2) / 2))}D`;
    this.bot.embed("🍆 Dicksize", `**${user.username}**'s dicksize is **${inches.toFixed(1)} inch${suffix(inches)}**.\n` + `${thedick}`, msg);
  }
}

module.exports = dicksizeCommand;
