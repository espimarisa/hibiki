const Command = require("../../lib/structures/Command");

class cookiesCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["balance"],
      args: "<member:member&fallback>",
      description: "Shows how many cookies you or another user has.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    let user = pargs[0].value;
    let cookies = 0;
    // Gets user's economy info
    let economydb = await this.bot.db.table("economy").get(user.id);
    if (!economydb) cookies = 0;
    else cookies = economydb.amount;
    // Sends the embed
    msg.channel.createMessage(this.bot.embed("🍪 Cookies", `**${user.username}** has **${cookies}** cookies.`));
  }
}

module.exports = cookiesCommand;
