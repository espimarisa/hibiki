const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class bitcoinCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[wallet:string]",
      aliases: ["bitcoinavg", "btc", "btcrate"],
      description: "Checks the BTC rate or info about a BTC wallet.",
    });
  }

  async run(msg, args) {
    // BTC rates
    if (!args.length) {
      let res = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
      let body = await res.json();
      if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Unable to check the rates. Try again later.", "error"));
      // Sets the description
      let fields = [];
      fields.push({ name: "USD", value: `$${body.bpi.USD.rate}`, inline: true });
      fields.push({ name: "EUR", value: `€${body.bpi.EUR.rate}`, inline: true });
      fields.push({ name: "GBP", value: `£${body.bpi.GBP.rate}`, inline: true });
      // Sends the embed
      msg.channel.createMessage({
        embed: {
          title: "💰 Bitcoin Rates",
          description: `Updated at ${body.time.updated}`,
          color: this.bot.embed.colour("general"),
          fields: fields,
        },
      });
    } else {
      // Address API
      let res = await fetch(`https://blockchain.info/rawaddr/${encodeURIComponent(args[0])}`);
      let body = await res.json();
      if (!body) return msg.channel.createMessage("❌ Error", "Address not found.", "error");
      // Sets the description
      let fields = [];
      fields.push({ name: "Balance", value: `${body.final_balance || 0} BTC`, inline: true });
      fields.push({ name: "Sent", value: `${body.total_sent || 0} BTC`, inline: true });
      fields.push({ name: "Received", value: `${Object.values(body)[3] || 0} BTC`, inline: true });
      // Sends the embed
      msg.channel.createMessage({
        embed: {
          title: `💰 ${body.address}`,
          color: this.bot.embed.colour("general"),
          fields: fields,
        },
      });
    }
  }
}

module.exports = bitcoinCommand;
