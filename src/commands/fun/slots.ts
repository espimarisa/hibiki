/**
 * @file Slots command
 * @description Gambles cookies in the slot machine
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

const EMOTES = ["🍒", "🍌", "💎"];
const MODIFIERS = [1, 2, 3];

export class SlotsCommand extends Command {
  description = "Gambles cookies in the slot machine.";
  args = "[amount:number]";
  aliases = ["bet", "gamble", "slot", "slotmachine", "sm"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    let profit = 0;
    let amount = parseInt(args?.[0]);
    const slotEmojis: string[] = [];

    // Sends modifiers if no args or invalid #
    if (!amount || isNaN(amount) || amount <= 0) {
      return msg.createEmbed(
        `🎰 ${msg.locale("fun.SLOTS")}`,
        msg.locale("fun.SLOTS_PLAY", {
          worth: EMOTES.map((e) => msg.locale("fun.SLOTS_WORTH", { emotes: e, modifier: MODIFIERS[EMOTES.indexOf(e)] })).join("\n"),
        }),
      );
    }

    // Pushes the emotes randomly
    for (let i = 0; i < 3; i++) {
      slotEmojis.push(EMOTES[Math.floor(Math.random() * EMOTES.length)]);
    }
    if (amount > 100) amount = 100;

    // Applies the profit; if 2 match, apply 1/3 profit (should result in evening out?)
    if (slotEmojis[0] === slotEmojis[1] && slotEmojis[1] === slotEmojis[2]) {
      profit = Math.round(amount * MODIFIERS[EMOTES.indexOf(slotEmojis[0])]);
    } else if (slotEmojis[0] === slotEmojis[1] || slotEmojis[1] === slotEmojis[2]) {
      profit = Math.round((amount * MODIFIERS[EMOTES.indexOf(slotEmojis[0])]) / 3);
    }

    // Gets user's cookies
    let cookies = await this.bot.db.getUserCookies(msg.author.id);
    if (!cookies) {
      await this.bot.db.insertBlankUserCookies(msg.author.id);

      cookies = {
        id: msg.author.id,
        amount: 0,
        lastclaim: null,
      };
    }

    // Compares amounts
    if (amount > cookies.amount || amount < 0) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("fun.SLOTS_NOTENOUGH", { amount: cookies.amount }), "error");
    }

    // Profit calculato
    profit > 0 ? (cookies.amount += profit) : (cookies.amount -= amount);
    cookies.amount = Math.floor(cookies.amount);

    // Updates user cookies
    await this.bot.db.updateUserCookies(msg.author.id, cookies);
    msg.createEmbed(
      `🎰 ${msg.locale("fun.SLOTS")}`,
      `${profit ? msg.locale("fun.SLOTS_WON", { amount: profit }) : msg.locale("fun.SLOTS_LOST")} \n${slotEmojis.join(" ")}`,
    );
  }
}
