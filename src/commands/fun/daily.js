const Command = require("../../structures/Command");

class dailyCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives your daily cookies.",
      allowdms: true,
    });
  }

  async run(msg) {
    // Formats time left in a day
    function formatDay(ms) {
      let h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s %= 60;
      h = Math.floor(m / 60);
      m %= 60;
      const d = Math.floor(h / 24);
      h %= 24;
      h += d * 24;
      return `**${h} hours** and **${m} minutes**`;
    }

    // Gets member's economy info
    let cookies = await this.bot.db.table("economy").get(msg.author.id).run();
    if (!cookies) {
      cookies = {
        id: msg.author.id,
        amount: 0,
        lastclaim: 9999,
      };

      // Inserts blank info if needed
      await this.bot.db.table("economy").insert(cookies).run();
    }

    // If lastclaim expired
    if (new Date() - new Date(cookies.lastclaim) > 86400000) {
      const amount = cookies.amount + 100;
      cookies = {
        id: msg.author.id,
        amount: amount,
        lastclaim: new Date(),
      };

      // Updates DB
      await this.bot.db.table("economy").get(msg.author.id).update(cookies).run();
      return this.bot.embed("🍪 Daily", "You've claimed your daily **100** cookies.", msg);
    }

    // If user is on cooldown
    const lastclaim = new Date(cookies.lastclaim);
    const time = 86400000 - (new Date().getTime() - lastclaim.getTime());
    this.bot.embed("🍪 Daily", `You can claim your daily cookies again in ${formatDay(time)}.`, msg);
  }
}

module.exports = dailyCommand;
