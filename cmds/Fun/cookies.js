const Command = require("../../lib/structures/Command");

class cookiesCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["balance"],
      args: "<member:member&fallback>",
      description: "Shows how many cookies you or another member has.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let cookies = 0;
    // Gets user's economy info
    const economydb = await this.bot.db.table("economy").get(user.id);
    if (!economydb) cookies = 0;
    else cookies = economydb.amount;
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🍪 Cookies", `**${user.username}** has **${cookies}** cookies.`));
  }
}

module.exports = cookiesCommand;
