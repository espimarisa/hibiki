import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class CoinCommand extends Command {
  description = "Flips a coin.";
  aliases = ["coinflip", "flip", "flipcoin", "flipacoin"];
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const coin = [msg.string("fun.COIN_HEADS"), msg.string("fun.COIN_TAILS")][Math.round(Math.random())];
    msg.createEmbed(`💰 ${msg.string("fun.COIN")}`, msg.string("fun.COIN_RESULT", { side: coin }));
  }
}
