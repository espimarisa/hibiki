/**
 * @file Coin command
 * @description Flips a coin
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class CoinCommand extends Command {
  description = "Flips a coin.";
  aliases = ["coinflip", "flip", "flipcoin", "flipacoin"];
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const coin = [msg.locale("fun.COIN_HEADS"), msg.locale("fun.COIN_TAILS")][Math.round(Math.random())];
    msg.createEmbed(`💰 ${msg.locale("fun.COIN")}`, msg.locale("fun.COIN_RESULT", { side: coin }));
  }
}
