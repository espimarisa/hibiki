const Command = require("../../lib/structures/Command");

class slotsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["bet", "gamble", "slot", "slotmachine", "sm"],
      args: "[amount:string]",
      description: "Bets cookies to use on a slot machine.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Profit, emotes, modifiers
    const baseprofit = args[0];
    const emotes = ["🍒", "🍌", "💎"];
    const modifiers = [1, 2, 5];
    const finalemotes = [];
    let profit = 0;

    // Sends modifiers
    if (!args[0] || isNaN(args[0])) {
      return msg.channel.createMessage(this.bot.embed("🎰 Slots", `${emotes.map(e => `${e} ${modifiers[emotes.indexOf(e)]} cookies`).join("\n") }`));
    }

    // Prevents mass gambling
    if (args[0] > 100) return msg.channel.createMessage(this.bot.embed("❌ Error", "You can't bet more than **100** cookies at a time.", "error"));

    // Gets the emotes
    for (let i = 0; i < 3; i++) {
      finalemotes.push(emotes[Math.floor(Math.random() * emotes.length)]);
    }

    // Applies the profit; if 2 match, apply half profit
    if (finalemotes[0] === finalemotes[1] && finalemotes[1] === finalemotes[2]) {
      profit = baseprofit * modifiers[emotes.indexOf(finalemotes[0])];
    } else if (finalemotes[0] === finalemotes[1] || finalemotes[1] === finalemotes[2]) {
      profit = baseprofit * modifiers[emotes.indexOf(finalemotes[0])] / 2;
    }

    // Gets user's cookies
    const emojistring = finalemotes.join(" ");
    let economydb = await this.bot.db.table("economy").get(msg.author.id);
    if (!economydb) {
      economydb = {
        id: msg.author.id,
        amount: 0,
        lastclaim: 9999,
      };
      await this.bot.db.table("economy").insert(economydb);
    }

    // Compares amounts
    const amount = parseInt(args[0]);
    const ucookies = await this.bot.db.table("economy").get(msg.author.id);
    if (amount > ucookies.amount || amount < 0) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have enough cookies for this bet.", "error"));
    }

    // Profit calculator
    if (profit > 0) {
      economydb.amount += profit;
    } else {
      economydb.amount -= args[0];
    }

    // Updates DB
    economydb.amount = Math.floor(economydb.amount);
    await this.bot.db.table("economy").get(msg.author.id).update(economydb);
    msg.channel.createMessage(this.bot.embed("🎰 Slots", `${profit ? `You won **${profit}** cookies!` : "Sorry, you lost."} \n ${emojistring}`));
  }
}

module.exports = slotsCommand;
