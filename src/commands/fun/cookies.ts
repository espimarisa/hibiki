/**
 * @file Cookies command
 * @description Tells how many cookies executor or another member has
 */

import type { Member, Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class CookiesCommand extends Command {
  description = "Tells how many cookies you or another member has.";
  args = "<member:member&fallback>";
  aliases = ["bal", "balance"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    let cookieAmount = 0;
    const member = pargs[0].value as Member;
    const cookies = await this.bot.db.getUserCookies(member.id);
    if (cookies?.amount) cookieAmount = cookies.amount;

    msg.createEmbed(
      `🍪 ${msg.locale("fun.COOKIES")}`,
      msg.locale("fun.COOKIES_AMOUNT", { member: member.user.username, amount: cookieAmount }),
    );
  }
}
