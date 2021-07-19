import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class CurrencyCommand extends Command {
  description = "Converts money from one currency to another.";
  args = "<amount:number> <from:string> <to:string>";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const amount = parseFloat(args[0]);
    const base = encodeURIComponent(args[1].toUpperCase());
    const to = encodeURIComponent(args[2].toUpperCase());

    // Gets conversion rates
    const body = await axios.get(`https://api.exchangeratesapi.io/latest?base=${base}&symbols=${to}`).catch(() => {});

    if (!body || !body.data || body?.data?.error) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.CURRENCY_NOTHING"), "error");
    }

    msg.createEmbed(
      `💱 ${msg.locale("utility.CURRENCY")}`,
      msg.locale("utility.CURRENCY_RATES", {
        amount: amount,
        from: base,
        amountTo: amount * body.data.rates[to].toFixed(3),
        to: to,
      }),
    );
  }
}
