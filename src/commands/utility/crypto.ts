import type { Message, TextChannel } from "eris";
// import { createCanvas } from "canvas";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import { dateFormat } from "../../utils/format";
import axios from "axios";
let currencies: any = undefined;

export class CryptoCommand extends Command {
  description = "Gets current cryptocurrency prices or converts between two coins.";
  args = "[coin:string] | [from:string] [to:string]";
  aliases = ["btc", "bitcoin", "cryptocurrency", "eth", "ethereum", "stellar", "xlm"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs) {
    if (!currencies) {
      currencies = await axios.get("https://api.coingecko.com/api/v3/coins/list");
      currencies = currencies.data;
    }

    // Gets the coins
    const coin = pargs[0].value?.toLowerCase();
    const to = pargs[1].value?.toLowerCase();

    // Request options
    const options = `vs_currencies=${to},usd,eur,gbp,cad,aud,rub&include_24hr_change=true&include_last_updated_at=true&include_market_cap=true`;

    // Finds the valid currency, defaults to Bitcoin
    let currency = currencies.find((c: Record<string, string>) => c.id === coin || c.symbol === coin || c.name.toLowerCase() === coin);
    if (!currency?.id) currency = { id: "bitcoin", name: "Bitcoin" };
    const body = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currency.id}&${options}`).catch((err) => {
      resError(err);
    });

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
        `💰 ${msg.string("utility.CRYPTO_TO", {
          base: currency.name,
          to: toCurrency.name,
        })}`,
        msg.string("utility.CRYPTO_EQUALSTO", {
          base: currency.name,
          value: data[to],
          to: toCurrency.name,
        }),
      );
    }

    // // Creates a price history graph
    // const priceHistoryData = await axios.get(`https://api.coingecko.com/api/v3/coins/${currency.id}/market_chart?vs_currency=usd&days=1`);
    // const priceHistory = priceHistoryData.data.prices;
    // const size = [200, 50];
    // const canvas = createCanvas(size[0], size[1]);
    // const ctx = canvas.getContext("2d");
    // const prices = priceHistory.map((price: number[]) => price[1]);
    // const thing = size[0] / priceHistory.length;
    // const highestPrice = Math.max(...prices);
    // // let oldPos;
    // priceHistory.forEach((price: number[], i: number) => {
    //   ctx.beginPath();
    //   ctx.moveTo(thing * i - thing, prices[i === 0 ? 0 : i - 1] * (size[1] / highestPrice));
    //   ctx.lineTo(thing * i, price[1] * (size[1] / highestPrice));
    //   console.log(price[1] * (size[1] / highestPrice));
    //   ctx.stroke();
    //   // price: e
    // });
    // const buf = canvas.toBuffer();

    // // console.log(priceHistory);

    // Sends price info
    msg.channel.createMessage(
      {
        embed: {
          title: `💰 ${currency.name}`,
          description: msg.string("utility.CRYPTO_UPDATEDAT", { time: dateFormat(data.last_updated_at * 1000) }),
          color: msg.convertHex("general"),
          fields: [
            {
              name: "USD",
              value: `${data.usd.toFixed(3)}`,
              inline: true,
            },
            {
              name: "EUR",
              value: `${data.eur.toFixed(3)}`,
              inline: true,
            },
            {
              name: "GBP",
              value: `${data.gbp.toFixed(3)}`,
              inline: true,
            },
            {
              name: "CAD",
              value: `${data.cad.toFixed(3)}`,
              inline: true,
            },
            {
              name: "AUD",
              value: `${data.aud.toFixed(3)}`,
              inline: true,
            },
            {
              name: "RUB",
              value: `${data.rub.toFixed(3)}`,
              inline: true,
            },
            {
              name: msg.string("utility.CRYPTO_24HRCHANGE"),
              value: `${data.usd_24h_change ? data.usd_24h_change.toFixed(3) : 0}%`,
            },
          ],
          // image: {
          // url: "attachment://graph.png",
          // },
          footer: {
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      },
      // {
      //   file: buf,
      //   name: "graph.png",
      // },
    );
  }
}
