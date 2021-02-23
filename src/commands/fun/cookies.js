const Command = require("../../structures/Command");

class cookiesCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["balance"],
      args: "<member:member&fallback>",
      description: "Shows how many cookies you or another member has.",
    });
  }

  async run(msg, args, pargs) {
    let cookies;
    const user = pargs[0].value;
    const economydb = await this.bot.db.table("economy").get(user.id).run();
    if (!economydb) cookies = 0;
    else cookies = economydb.amount;

    this.bot.embed(
      "🍪 Cookies",
      `${user.id === msg.author.id ? "You have" : `**${user.username}** has`} **${cookies}** cookie${cookies === 1 ? "" : "s"}.`,
      msg,
    );
  }
}

module.exports = cookiesCommand;
