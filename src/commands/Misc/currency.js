const Command = require("../../lib/structures/Command");
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
    // Handler for if the amount isn't a number
    if (isNaN(amount)) {
      to = from;
      from = amount;
    }

    if (!from) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No amount to convert from was provided.", "error"));
    }

    if (!to) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No amount to convert to was provided.", "error"));
    }

    // Fetches the API
    const body = await fetch(`https://api.exchangeratesapi.io/latest?base=${encodeURIComponent(from.toUpperCase())}&symbols=${encodeURIComponent(to.toUpperCase())}`)
      .then(async res => await res.json().catch(() => {}));
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Failed to send the rates. Try again later.", "error"));
    if (body.error !== undefined) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No information found.", "error"));
    }

    // Sends the embed
    if (isNaN(amount)) {
      msg.channel.createMessage(this.bot.embed(`💱 ${body.base} to ${to.toUpperCase()}`, `${Object.keys(body.rates).map(k => `**${k}**: ${body.rates[k].toFixed(2)}`).join("\n")}`));
    } else {
      msg.channel.createMessage(this.bot.embed("💱 Currency", `**${amount}** ${body.base} ~ **${amount * body.rates[to.toUpperCase()].toFixed(2)}** ${to.toUpperCase()}`));
    }
  }
}

module.exports = currencyCommand;
