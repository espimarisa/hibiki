const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class bitcoinCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["bitcoinavg", "btc", "btcrate"],
      args: "[wallet:string]",
      description: "Checks BTC rates or info about a BTC wallet.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // BTC rates
    if (!args.length) {
      const body = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json").then(res => res.json().catch(() => {}));
      if (!body) return this.bot.embed("❌ Error", "Unable to check the rates. Try again later.", msg, "error");

      // Embed fields
      const fields = [];
      fields.push({
        name: "USD",
        value: `$${body.bpi.USD.rate}`,
        inline: true,
      });

      fields.push({
        name: "EUR",
        value: `€${body.bpi.EUR.rate}`,
        inline: true,
      });

      fields.push({
        name: "GBP",
        value: `£${body.bpi.GBP.rate}`,
        inline: true,
      });

      return msg.channel.createMessage({
        embed: {
          title: "💰 Bitcoin Rates",
          description: `Updated at ${body.time.updated}`,
          color: 0xF89E32,
          fields: fields,
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }

    // Bitcoin addresses
    const body = await fetch(`https://blockchain.info/rawaddr/${encodeURIComponent(args[0])}`)
      .then(res => res.json().catch(() => {}));
    if (!body) return this.bot.embed("❌ Error", "Address not found.", msg, "error");

    // Embed fields
    const fields = [];
    fields.push({
      name: "Balance",
      value: `${body.final_balance || 0} BTC`,
      inline: true,
    });

    fields.push({
      name: "Sent",
      value: `${body.total_sent || 0} BTC`,
      inline: true,
    });

    fields.push({
      name: "Received",
      value: `${Object.values(body)[3] || 0} BTC`,
      inline: true,
    });

    msg.channel.createMessage({
      embed: {
        title: `💰 ${body.address}`,
        color: 0xF89E32,
        fields: fields,
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = bitcoinCommand;
