const Command = require("structures/Command");
const fetch = require("node-fetch");

class currencyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["convert", "convertmoney"],
      args: "<amount:string> [from:string] [to:string]",
      description: "Converts money from one currency to another",
      cooldown: 3,
    });
  }

  async run(msg, [amount, from, to]) {
    if (isNaN(amount)) {
      to = from;
      from = amount;
    }

    if (!from) return this.bot.embed("❌ Error", "No amount to **convert from** was provided.", msg, "error");
    if (!to) return this.bot.embed("❌ Error", "No amount to **convert to** was provided.", msg, "error");

    const body = await fetch(
      `https://api.exchangeratesapi.io/latest?base=${encodeURIComponent(from.toUpperCase())}&symbols=${encodeURIComponent(to.toUpperCase())}`,
    ).then(async res => await res.json().catch(() => {}));

    if (!body) return this.bot.embed("❌ Error", "Failed to send the rates. Try again later.", msg, "error");
    if (body.error && body.error !== undefined) return this.bot.embed("❌ Error", "No conversion rates found.", msg, "error");

    if (isNaN(amount)) {
      this.bot.embed(
        `💱 ${body.base} to ${to.toUpperCase()}`,
        `${Object.keys(body.rates).map(k => `**${k}**: ${body.rates[k].toFixed(2)}`).join("\n")}`,
        msg);
    } else {
      this.bot.embed(
        "💱 Currency",
        `**${amount}** ${body.base} ~ **${amount * body.rates[to.toUpperCase()].toFixed(2)}** ${to.toUpperCase()}`,
        msg);
    }
  }
}

module.exports = currencyCommand;
