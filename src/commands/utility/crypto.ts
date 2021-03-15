import type { Message, TextChannel } from "eris";
import { createCanvas } from "canvas";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import axios from "axios";

let currencies: any = undefined;

export class CryptoCommand extends Command {
  description = "Gets current cryptocurrency prices or converts between two coins.";
  args = "[coin:string] | [from:string] [to:string]";
  aliases = ["btc", "bitcoin", "cryptocurrency", "dogecoin", "eth", "ethereum", "ripple", "stellar", "xlm", "xrp"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    if (!currencies) {
      currencies = await axios.get("https://api.coingecko.com/api/v3/coins/list");
      currencies = currencies.data;
    }

    // Gets the coins
    const coin = pargs[0].value?.toLowerCase() || this.aliases.find((alias) => msg.content.startsWith(`${msg.prefix}${alias}`));
    const to = pargs[1].value?.toLowerCase();

    // Request options
    const options = `vs_currencies=${to},usd,eur,gbp,cad,aud,rub,jpy,czk,chf&include_24hr_change=true&include_last_updated_at=true&include_market_cap=true`;

    // Finds the valid currency, defaults to Bitcoin
    let currency = currencies.find((c: Record<string, string>) => c.id === coin || c.symbol === coin || c.name.toLowerCase() === coin);
    if (!currency?.id) currency = { id: "bitcoin", name: "Bitcoin" };
    const body = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currency.id}&${options}`).catch(() => {});

    // If nothing is found
    if (!body || !body.data?.[currency?.id]) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.CRYPTO_ERROR"), "error");
    }

    // Gets data and sets fields
    const data = body.data[currency.id];

    // If converting between two things
    if (to && data?.[to]) {
      let toCurrency = currencies.find((c: Record<string, string>) => c.id === to || c.symbol === to || c.name.toLowerCase() === to);
      if (!toCurrency) toCurrency = { name: to, id: to };

      // Sends conversion info
      return msg.createEmbed(
        `💰 ${msg.string("utility.CRYPTO_TO", { base: currency.name, to: toCurrency.name })}`,
        msg.string("utility.CRYPTO_EQUALSTO", { base: currency.name, value: data[to], to: toCurrency.name }),
      );
    }

    // Formats decimals
    const decimalFormat = (a: number) => (a % 1 === 0 ? a : a.toFixed(3));

    // Gets price history data
    const priceHistoryData = await axios.get(`https://api.coingecko.com/api/v3/coins/${currency.id}/market_chart?vs_currency=usd&days=1`);
    const priceHistory = priceHistoryData.data.prices;

    // Creates the canvas and calculates min/max
    const size = [350, 100];
    const canvas = createCanvas(size[0], size[1]);
    const ctx = canvas.getContext("2d");
    const prices = priceHistory.map((price: number[]) => price[1]);
    const dates = priceHistory.map((price: number[]) => price[0]);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const highestDate = Math.max(...dates);
    const lowestDate = Math.min(...dates);

    ctx.beginPath();
    // Draws the graph using the data
    priceHistory.forEach((price: number[]) => {
      // Calculates move and line info
      const x = (size[0] * (price[0] - lowestDate)) / (highestDate - lowestDate);
      const y = ((size[1] - 0) * (price[1] - lowestPrice)) / (highestPrice - lowestPrice);
      ctx.lineTo(x, Math.abs(y - size[1]));
    });

    ctx.lineWidth = 2;
    ctx.strokeStyle = this.bot.config.colors.general;
    ctx.stroke();

    const gradient = ctx.createLinearGradient(size[0] / 2, 0, size[0] / 2, size[1]);
    gradient.addColorStop(0.2, `${this.bot.config.colors.general}77`);
    gradient.addColorStop(1, `${this.bot.config.colors.general}00`);
    ctx.lineTo(size[0], size[1]);
    ctx.lineTo(0, size[1]);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Convets canvas to a Buffer
    const buf = canvas.toBuffer();

    // Sends price info
    msg.channel.createMessage(
      {
        embed: {
          title: `💰 ${currency.name}`,
          description: msg.string("utility.CRYPTO_UPDATEDAT", { time: dateFormat(data.last_updated_at * 1000, msg.string) }),
          color: msg.convertHex("general"),
          fields: [
            {
              name: "USD",
              value: decimalFormat(data.usd).toString(),
              inline: true,
            },
            {
              name: "EUR",
              value: decimalFormat(data.eur).toString(),
              inline: true,
            },
            {
              name: "GBP",
              value: decimalFormat(data.gbp).toString(),
              inline: true,
            },
            {
              name: "CAD",
              value: decimalFormat(data.cad).toString(),
              inline: true,
            },
            {
              name: "AUD",
              value: decimalFormat(data.aud).toString(),
              inline: true,
            },
            {
              name: "CHF",
              value: decimalFormat(data.chf).toString(),
              inline: true,
            },
            {
              name: "JPY",
              value: decimalFormat(data.jpy).toString(),
              inline: true,
            },
            {
              name: "CZK",
              value: decimalFormat(data.czk).toString(),
              inline: true,
            },
            {
              name: "RUB",
              value: decimalFormat(data.rub).toString(),
              inline: true,
            },
            {
              name: msg.string("utility.CRYPTO_24HRCHANGE"),
              value: `${data.usd_24h_change ? data.usd_24h_change.toFixed(3) : 0}%`,
              inline: true,
            },
          ],
          image: {
            url: "attachment://graph.png",
          },
          footer: {
            text: msg.string("global.RAN_BY", {
              author: msg.tagUser(msg.author),
              poweredBy: "coingecko.com",
            }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      },
      {
        file: buf,
        name: "graph.png",
      },
    );
  }
}
