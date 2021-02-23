const Command = require("../../structures/Command");

class payCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["give", "givecookie", "givecookies"],
      args: "<member:member> <amount:string>",
      description: "Gives a member some cookies.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const amount = parseInt(args[1]);

    // Blocks bots, selfpaying, and non-integers
    if (user.bot) return this.bot.embed("❌ Error", "You can't give cookies to a bot.", msg, "error");
    if (user.id === msg.author.id) return this.bot.embed("❌ Error", "Fraud is illegal.", msg, "error");
    if (!amount || isNaN(amount) || amount < 0) return this.bot.embed("❌ Error", "You provided an invalid amount of cookies.", msg, "error");

    // Gets author & user's cookies
    let ucookies = await this.bot.db.table("economy").get(user.id).run();
    let acookies = await this.bot.db.table("economy").get(msg.author.id).run();

    if (!ucookies) {
      await this.bot.db.table("economy").insert({
        id: user.id,
        amount: 0,
        lastclaim: 9999,
      }).run();

      ucookies = await this.bot.db.table("economy").get(user.id).run();
    }

    if (!acookies) {
      await this.bot.db.table("economy").insert({
        id: user.id,
        amount: 0,
        lastclaim: 9999,
      }).run();

      acookies = await this.bot.db.table("economy").get(msg.author.id).run();
    }

    // Compares cookie amounts
    if (!acookies || amount > acookies.amount || acookies && acookies.amount <= 0) {
      return this.bot.embed("❌ Error", "You don't have enough cookies.", msg, "error");
    }

    acookies.amount -= amount;
    ucookies.amount += amount;

    // Updates cookie amounts
    await this.bot.db.table("economy").get(user.id).update(ucookies).run();
    await this.bot.db.table("economy").get(msg.author.id).update(acookies).run();
    this.bot.embed("🍪 Pay", `You gave **${amount}** cookie${amount === 1 ? "" : "s"} to **${user.username}**.`, msg);
  }
}

module.exports = payCommand;
