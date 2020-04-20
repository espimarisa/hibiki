const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class dailyCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives you your daily cookies.",
    });
  }

  async run(msg) {
    // Gets user's economy info
    let cookies = await this.bot.db.table("economy").get(msg.author.id);
    // If user has no cookies
    if (!cookies) {
      cookies = {
        id: msg.author.id,
        amount: 0,
        lastclaim: 9999,
      };
      // Updates DB
      await this.bot.db.table("economy").insert(cookies);
    }
    // If lastclaim expired
    if (new Date() - new Date(cookies.lastclaim) > 86400000) {
      let amount = cookies.amount + 100;
      cookies = {
        id: msg.author.id,
        amount: amount,
        lastclaim: new Date(),
      };
      // Updates DB
      await this.bot.db.table("economy").get(msg.author.id).update(cookies);
      msg.channel.createMessage(this.bot.embed("🍪 Daily Cookies", "You have claimed your daily **100** cookies."));
    } else {
      // If user is on cooldown
      let lastclaim = new Date(cookies.lastclaim);
      let time = 86400000 - (new Date().getTime() - lastclaim.getTime());
      msg.channel.createMessage(this.bot.embed("🍪 Daily Cookies", `You can claim your daily cookies again in **${format.day(time)}**.`));
    }
  }
}

module.exports = dailyCommand;
